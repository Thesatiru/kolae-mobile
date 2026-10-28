import { createShowcaseStore } from './store';

// Vitrine: o chat com a quadra ainda não existe na API. Nada aqui sai do celular.

export type ChatMessage =
  | { id: string; from: 'me' | 'venue'; kind: 'text'; text: string; at: string }
  | { id: string; from: 'venue'; kind: 'location'; at: string };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

// Conversa de exemplo do Figma ("Opa, pode enviar o endereço?" / "Claro!" + localização).
export const chatStore = createShowcaseStore<ChatMessage[]>(() => [
  { id: 'seed-1', from: 'me', kind: 'text', text: 'Opa, pode enviar o endereço?', at: minutesAgo(5) },
  { id: 'seed-2', from: 'venue', kind: 'text', text: 'Claro!', at: minutesAgo(2) },
  { id: 'seed-3', from: 'venue', kind: 'location', at: minutesAgo(2) },
]);

export const AUTO_REPLY_DELAY_MS = 1800;
