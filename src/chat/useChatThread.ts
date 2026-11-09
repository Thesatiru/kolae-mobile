import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { listMessages, markRead, sendMessage } from '@/api/chat';
import { toApiError, type ApiRequestError } from '@/api/errors';
import type { ChatMessage, Conversation } from '@/api/types';

// Intervalos da proposta (docs/proposta-chat.md). Com o app em segundo plano não consulta
// (focusManager em network/online.ts). Se a HostGator reclamar, a proposta sobe para 10 s e 60 s.
export const THREAD_POLL_MS = 5_000;
export const LIST_POLL_MS = 30_000;
const PAGE_SIZE = 30;
export const BODY_MAX = 1000;

export const conversationsKey = ['conversations'] as const;
export const conversationKey = (venueId: number) => ['conversation', 'venue', venueId] as const;
const threadKey = (conversationId: number) => ['conversation', conversationId, 'messages'] as const;

type Thread = { messages: ChatMessage[]; hasOlder: boolean };
const NO_MESSAGES: ChatMessage[] = [];

/** Mensagem que saiu do celular e ainda não voltou da API (ou falhou). */
export type Outgoing = { localId: string; body: string; status: 'sending' | 'failed'; error?: string };

/** Por que a pessoa não pode mais escrever: bloqueada pelo responsável ou quadra desativada. */
export type Closed = 'blocked' | 'unavailable' | null;

/** Junta sem repetir (o polling e o envio podem trazer a mesma) e em ordem crescente de id. */
function merge(a: ChatMessage[], b: ChatMessage[]) {
  const byId = new Map<number, ChatMessage>();
  for (const m of a) byId.set(m.id, m);
  for (const m of b) byId.set(m.id, m);
  return [...byId.values()].sort((x, y) => x.id - y.id);
}

/** Atualiza a conversa na lista "Mensagens" sem esperar o próximo polling dela. */
function patchConversation(queryClient: QueryClient, id: number, patch: (c: Conversation) => Conversation) {
  queryClient.setQueryData<Conversation[]>(conversationsKey, (list) => list?.map((c) => (c.id === id ? patch(c) : c)));
}

export function useChatThread(
  conversation: Conversation | undefined,
  options: { venueName: string; onRejected: (body: string, error: ApiRequestError) => void },
) {
  const queryClient = useQueryClient();
  const conversationId = conversation?.id;
  const key = threadKey(conversationId ?? 0);

  // Uma consulta só: a primeira busca traz as mais recentes; as próximas (a cada 5 s) pedem só
  // o que veio depois da última (after_id) e juntam no que já está na tela.
  const thread = useQuery({
    queryKey: key,
    enabled: conversationId !== undefined,
    staleTime: 0,
    refetchInterval: THREAD_POLL_MS,
    queryFn: async (): Promise<Thread> => {
      const id = conversationId!;
      const current = queryClient.getQueryData<Thread>(key);
      const lastId = current?.messages[current.messages.length - 1]?.id;
      if (!current || lastId === undefined) {
        const page = await listMessages(id, { per_page: PAGE_SIZE });
        return { messages: page, hasOlder: page.length === PAGE_SIZE };
      }
      const fresh = await listMessages(id, { after_id: lastId, per_page: 50 });
      // Pode ter chegado coisa enquanto esperava (envio, página antiga): junta no mais recente.
      const latest = queryClient.getQueryData<Thread>(key) ?? current;
      return { ...latest, messages: merge(latest.messages, fresh) };
    },
  });
  const messages = thread.data?.messages ?? NO_MESSAGES;

  // Mensagens mais antigas, ao rolar até o topo (before_id).
  const [loadingOlder, setLoadingOlder] = useState(false);
  async function loadOlder() {
    const first = messages[0];
    if (conversationId === undefined || !first || !thread.data?.hasOlder || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await listMessages(conversationId, { before_id: first.id, per_page: PAGE_SIZE });
      queryClient.setQueryData<Thread>(key, (prev) => ({
        messages: merge(page, prev?.messages ?? []),
        hasOlder: page.length === PAGE_SIZE,
      }));
    } catch {
      // tenta de novo na próxima vez que chegar ao topo
    } finally {
      setLoadingOlder(false);
    }
  }

  // Envio otimista: aparece na hora como "enviando"; se falhar, fica "não enviada" com
  // tocar para tentar de novo.
  const [outbox, setOutbox] = useState<Outgoing[]>([]);
  const [closed, setClosed] = useState<Closed>(null);
  const isClosed = closed ?? (conversation?.blocked ? 'blocked' : null);

  async function deliver(localId: string, body: string) {
    if (conversationId === undefined) return;
    setOutbox((list) => list.map((o) => (o.localId === localId ? { ...o, status: 'sending', error: undefined } : o)));
    try {
      const message = await sendMessage(conversationId, body);
      setOutbox((list) => list.filter((o) => o.localId !== localId));
      queryClient.setQueryData<Thread>(key, (prev) => ({
        messages: merge(prev?.messages ?? [], [message]),
        hasOlder: prev?.hasOlder ?? false,
      }));
      patchConversation(queryClient, conversationId, (c) => ({ ...c, last_message: message }));
      void queryClient.invalidateQueries({ queryKey: conversationsKey }); // reordena a lista
    } catch (err) {
      const error = toApiError(err);
      if (error.code === 'VALIDATION_ERROR') {
        // Erro no texto (link, tamanho): volta para o campo, com o erro embaixo.
        setOutbox((list) => list.filter((o) => o.localId !== localId));
        options.onRejected(body, error);
        return;
      }
      if (error.code === 'CHAT_BLOCKED') {
        setClosed('blocked');
        patchConversation(queryClient, conversationId, (c) => ({ ...c, blocked: true }));
      } else if (error.status === 404) {
        setClosed('unavailable'); // quadra desativada: a conversa fica só para leitura
      }
      setOutbox((list) =>
        list.map((o) => (o.localId === localId ? { ...o, status: 'failed', error: error.message } : o)),
      );
    }
  }

  function send(body: string) {
    const localId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setOutbox((list) => [...list, { localId, body, status: 'sending' }]);
    void deliver(localId, body);
  }

  const retry = (localId: string) => {
    const item = outbox.find((o) => o.localId === localId);
    if (item) void deliver(localId, item.body);
  };
  const discard = (localId: string) => setOutbox((list) => list.filter((o) => o.localId !== localId));

  // Lida: avisa a API até a última mensagem que está na tela, só quando chega algo da quadra.
  const lastMessage = messages[messages.length - 1];
  const lastIncomingId = [...messages].reverse().find((m) => !m.mine)?.id;
  const markedUpTo = useRef(0);
  useEffect(() => {
    if (conversationId === undefined || !lastMessage || lastIncomingId === undefined) return;
    if (lastIncomingId <= markedUpTo.current) return;
    markedUpTo.current = lastMessage.id;
    markRead(conversationId, lastMessage.id)
      .then(() => patchConversation(queryClient, conversationId, (c) => ({ ...c, unread_count: 0 })))
      .catch(() => {
        markedUpTo.current = 0; // tenta de novo no próximo polling
      });
  }, [conversationId, lastMessage, lastIncomingId, queryClient]);

  // Leitor de tela: anuncia o que chega pelo polling (não o histórico ao abrir).
  const announcedUpTo = useRef<number | null>(null);
  useEffect(() => {
    if (!thread.data) return;
    const lastId = lastMessage?.id ?? 0;
    if (announcedUpTo.current === null) {
      announcedUpTo.current = lastId;
      return;
    }
    const arrived = messages.filter((m) => !m.mine && m.id > announcedUpTo.current!);
    announcedUpTo.current = Math.max(announcedUpTo.current, lastId);
    for (const m of arrived) AccessibilityInfo.announceForAccessibility(`${options.venueName}: ${m.body}`);
  }, [thread.data, messages, lastMessage, options.venueName]);

  return {
    messages,
    loading: thread.isPending && conversationId !== undefined,
    error: thread.data ? null : thread.error, // polling que falhou com mensagens na tela: segue em silêncio
    refetch: thread.refetch,
    hasOlder: thread.data?.hasOlder ?? false,
    loadingOlder,
    loadOlder,
    outbox,
    send,
    retry,
    discard,
    closed: isClosed,
  };
}
