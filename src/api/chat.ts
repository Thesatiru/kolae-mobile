import { api, MOCK_CHAT } from './client';
import {
  mockListConversations,
  mockListMessages,
  mockMarkRead,
  mockOpenConversation,
  mockSendMessage,
} from './mocks/chat.mock';
import type { ApiSuccess, ChatMessage, Conversation, MessagesQuery } from './types';

// Chat com o responsável pela quadra (docs/proposta-chat.md). Todas as rotas exigem token; quem
// não faz parte da conversa recebe 404.

/** Conversas da pessoa logada, a mais recente primeiro. */
export async function listConversations(): Promise<Conversation[]> {
  if (MOCK_CHAT) return mockListConversations();
  const res = await api.get<ApiSuccess<Conversation[]>>('/conversations');
  return res.data.data;
}

/**
 * Abre a conversa com a quadra ou devolve a que já existe (201 ou 200, mesmo objeto).
 * Erros: 404 VENUE_NOT_FOUND; 422 CHAT_OWN_VENUE (o responsável na própria quadra).
 */
export async function openConversation(venueId: number): Promise<Conversation> {
  if (MOCK_CHAT) return mockOpenConversation(venueId);
  const res = await api.post<ApiSuccess<Conversation>>(`/venues/${venueId}/conversations`);
  return res.data.data;
}

/** Mensagens em ordem crescente de id. Sem after_id/before_id: as mais recentes. */
export async function listMessages(conversationId: number, query: MessagesQuery = {}): Promise<ChatMessage[]> {
  if (MOCK_CHAT) return mockListMessages(conversationId, query);
  const res = await api.get<ApiSuccess<ChatMessage[]>>(`/conversations/${conversationId}/messages`, { params: query });
  return res.data.data;
}

/**
 * Envia uma mensagem (201 com a mensagem criada). Erros: 422 VALIDATION_ERROR em errors.body
 * (vazia, mais de 1000 caracteres ou com link), 403 CHAT_BLOCKED, 429 TOO_MANY_ATTEMPTS
 * (mais de 20 por minuto) e 404 (quadra desativada ou conversa que não é sua).
 */
export async function sendMessage(conversationId: number, body: string): Promise<ChatMessage> {
  if (MOCK_CHAT) return mockSendMessage(conversationId, body);
  const res = await api.post<ApiSuccess<ChatMessage>>(`/conversations/${conversationId}/messages`, { body });
  return res.data.data;
}

/** Marca como lida até esta mensagem (204). Zera o unread_count do lado da pessoa. */
export async function markRead(conversationId: number, lastMessageId: number): Promise<void> {
  if (MOCK_CHAT) return mockMarkRead(conversationId, lastMessageId);
  await api.post(`/conversations/${conversationId}/read`, { last_message_id: lastMessageId });
}
