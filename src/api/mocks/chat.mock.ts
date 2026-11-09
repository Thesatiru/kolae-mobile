import { hasLink } from '@/utils/links';
import { ApiRequestError } from '../errors';
import type { ChatMessage, Conversation, MessagesQuery } from '../types';
import { getVenue, listVenues } from '../venues';
import { delay } from './delay';

// Faz o papel da API do chat (docs/proposta-chat.md): mesmos status, códigos e formato.
// Guarda tudo na memória do app. O "responsável" responde sozinho alguns segundos depois de cada
// mensagem, e a resposta só aparece pelo polling, como na API real.
//
// Comandos de teste (mande como mensagem):
//   #bloquear  o responsável bloqueia a conversa (a próxima mensagem dá 403 CHAT_BLOCKED)
//   #falhar    a primeira tentativa dá erro 500 (para testar "falhou, tocar para reenviar")

const BODY_MAX = 1000;
const PER_PAGE_DEFAULT = 30;
const PER_PAGE_MAX = 50;
const RATE_LIMIT_PER_MINUTE = 20;
const REPLY_DELAY_MS = 3000;

const REPLIES = [
  'Oi! Tudo bem? Pode perguntar, que eu respondo por aqui.',
  'Temos horário livre amanhã de manhã, das 8h às 12h.',
  'O valor é por hora, e a quadra já vem com as bolas.',
  'Combinado! Qualquer coisa, é só chamar.',
];

type StoredMessage = { id: number; body: string; fromOwner: boolean; created_at: string };
type StoredConversation = {
  id: number;
  venue: Conversation['venue'];
  messages: StoredMessage[];
  userLastReadId: number | null;
  blocked: boolean;
};

const conversations: StoredConversation[] = [];
let nextConversationId = 1;
let nextMessageId = 1;
let seeded = false;
const sentAt: number[] = []; // horários dos envios, para o limite por minuto
const failedOnce = new Set<string>(); // corpos com #falhar que já falharam uma vez
const replyTimers = new Map<number, ReturnType<typeof setTimeout>>();

/** Agora em horário de Brasília, com o fuso na data, como a API manda (D16). */
function nowBrt(offsetMinutes = 0) {
  const date = new Date(Date.now() + offsetMinutes * 60_000 - 3 * 60 * 60_000);
  return date.toISOString().replace(/\.\d{3}Z$/, '-03:00');
}

function addMessage(conversation: StoredConversation, body: string, fromOwner: boolean, created_at = nowBrt()) {
  const message: StoredMessage = { id: nextMessageId++, body, fromOwner, created_at };
  conversation.messages.push(message);
  return message;
}

const toMessage = (m: StoredMessage): ChatMessage => ({ id: m.id, body: m.body, mine: !m.fromOwner, created_at: m.created_at });

function toConversation(c: StoredConversation): Conversation {
  const last = c.messages[c.messages.length - 1];
  const unread = c.messages.filter((m) => m.fromOwner && m.id > (c.userLastReadId ?? 0)).length;
  return { id: c.id, venue: c.venue, last_message: last ? toMessage(last) : null, unread_count: unread, blocked: c.blocked };
}

function find(conversationId: number) {
  const conversation = conversations.find((c) => c.id === conversationId);
  // Quem não faz parte da conversa recebe 404 (não revela que ela existe).
  if (!conversation) throw new ApiRequestError(404, 'NOT_FOUND', 'Conversa não encontrada.');
  return conversation;
}

async function createFor(venueId: number) {
  let venue;
  try {
    venue = await getVenue(venueId);
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      throw new ApiRequestError(404, 'VENUE_NOT_FOUND', 'Quadra não encontrada.');
    }
    throw err;
  }
  const conversation: StoredConversation = {
    id: nextConversationId++,
    venue: { id: venue.id, name: venue.name, cover_image_url: venue.cover_image_url },
    messages: [],
    userLastReadId: null,
    blocked: false,
  };
  conversations.push(conversation);
  return conversation;
}

// Uma conversa de exemplo na primeira vez, com a primeira quadra da lista e uma resposta não lida.
async function seed() {
  if (seeded) return;
  seeded = true;
  try {
    const first = (await listVenues({ per_page: 1 })).data[0];
    if (!first || conversations.some((c) => c.venue.id === first.id)) return;
    const conversation = await createFor(first.id);
    addMessage(conversation, 'Oi! A quadra está livre no sábado à tarde?', false, nowBrt(-40));
    addMessage(conversation, 'Oi! Está sim, das 14h às 18h. Quer que eu reserve?', true, nowBrt(-25));
  } catch {
    // sem quadras (ou sem internet com as quadras reais): a lista começa vazia
  }
}

function scheduleReply(conversation: StoredConversation) {
  const pending = replyTimers.get(conversation.id);
  if (pending) clearTimeout(pending); // várias seguidas: uma resposta só
  replyTimers.set(
    conversation.id,
    setTimeout(() => {
      replyTimers.delete(conversation.id);
      if (conversation.blocked) return;
      const owner = conversation.messages.filter((m) => m.fromOwner).length;
      addMessage(conversation, REPLIES[owner % REPLIES.length], true);
    }, REPLY_DELAY_MS),
  );
}

export async function mockListConversations(): Promise<Conversation[]> {
  await seed();
  await delay(400);
  return conversations
    .map(toConversation)
    .sort((a, b) => (b.last_message?.id ?? 0) - (a.last_message?.id ?? 0) || b.id - a.id);
}

export async function mockOpenConversation(venueId: number): Promise<Conversation> {
  await seed();
  await delay(400);
  const existing = conversations.find((c) => c.venue.id === venueId);
  return toConversation(existing ?? (await createFor(venueId)));
}

export async function mockListMessages(conversationId: number, query: MessagesQuery): Promise<ChatMessage[]> {
  await delay(300);
  const conversation = find(conversationId);
  const perPage = Math.min(Math.max(query.per_page ?? PER_PAGE_DEFAULT, 1), PER_PAGE_MAX);
  const all = conversation.messages;
  if (query.after_id !== undefined) {
    return all.filter((m) => m.id > query.after_id!).slice(0, perPage).map(toMessage);
  }
  const older = query.before_id !== undefined ? all.filter((m) => m.id < query.before_id!) : all;
  return older.slice(-perPage).map(toMessage); // as mais recentes, ainda em ordem crescente
}

export async function mockSendMessage(conversationId: number, rawBody: string): Promise<ChatMessage> {
  await delay(500);
  const conversation = find(conversationId);
  const body = rawBody.trim();

  if (!body) throw validation('Escreva uma mensagem.');
  if (body.length > BODY_MAX) throw validation(`A mensagem pode ter até ${BODY_MAX} caracteres.`);
  if (hasLink(body)) throw validation('Mensagens não podem ter links.');
  if (conversation.blocked) {
    throw new ApiRequestError(403, 'CHAT_BLOCKED', 'O responsável pela quadra não recebe mais mensagens nesta conversa.');
  }

  const minuteAgo = Date.now() - 60_000;
  while (sentAt.length && sentAt[0] < minuteAgo) sentAt.shift();
  if (sentAt.length >= RATE_LIMIT_PER_MINUTE) {
    throw new ApiRequestError(429, 'TOO_MANY_ATTEMPTS', 'Muitas mensagens seguidas. Espere um pouco e tente de novo.');
  }

  if (body.includes('#falhar') && !failedOnce.has(body)) {
    failedOnce.add(body);
    throw new ApiRequestError(500, 'SERVER_ERROR', 'Erro interno do servidor.');
  }

  sentAt.push(Date.now());
  const message = addMessage(conversation, body, false);
  if (body.includes('#bloquear')) conversation.blocked = true;
  else scheduleReply(conversation);
  return toMessage(message);
}

export async function mockMarkRead(conversationId: number, lastMessageId: number): Promise<void> {
  await delay(150);
  const conversation = find(conversationId);
  conversation.userLastReadId = Math.max(conversation.userLastReadId ?? 0, lastMessageId);
}

function validation(message: string) {
  return new ApiRequestError(422, 'VALIDATION_ERROR', 'Verifique os campos informados.', { body: [message] });
}
