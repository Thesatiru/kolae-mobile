import { createShowcaseStore } from './store';

// Vitrine (D04): a Comunidade não existe na API. Posts, curtidas e comentários são de exemplo
// e o que a pessoa faz fica só na memória enquanto o app está aberto.

export type Author = {
  name: string;
  handle: string;
  owner?: boolean; // responsável pela quadra: ganha o selo
  tone: 'primary' | 'strong'; // cor do círculo das iniciais
};

export type Post = {
  id: number;
  author: Author;
  text: string;
  at: string; // ISO
  imageUrl?: string;
  imageAlt?: string; // descrição da foto para o leitor de tela
  venue?: string; // quadra marcada
  likes: number;
  liked: boolean;
  comments: number;
  friend: boolean; // aparece em "Amigos"
};

export type Comment = { id: string; author: Author; text: string; at: string; likes: number; liked: boolean };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

const lucas: Author = { name: 'Lucas Andrade', handle: 'lucasandrade', tone: 'primary' };
const bia: Author = { name: 'Bia Santos', handle: 'biasantos', tone: 'strong' };
const xuxa: Author = { name: 'Quadra do Xuxa', handle: 'quadradoxuxa', owner: true, tone: 'strong' };
const marcos: Author = { name: 'Marcos Antonio', handle: 'marcosantonio', tone: 'strong' };
const joao: Author = { name: 'João Pedro', handle: 'joaopedro', tone: 'primary' };
const duda: Author = { name: 'Duda Lima', handle: 'dudalima', tone: 'primary' };
const gabi: Author = { name: 'Gabi Rocha', handle: 'gabirocha', tone: 'strong' };

export const showcaseVenues = ['Arena Suzano', 'Quadra do Xuxa', 'Quadra FATEC Ferraz', 'Arena Ferraz', 'SESI - Suzano'];

const SEED: Post[] = [
  {
    id: 1,
    author: lucas,
    text: 'Alguém completa o time hoje às 21h? Faltam 2 pessoas pra fechar o society ⚽',
    at: minutesAgo(12),
    venue: 'Arena Suzano',
    likes: 24,
    liked: false,
    comments: 8,
    friend: false,
  },
  {
    id: 2,
    author: bia,
    text: 'Primeira vez no vôlei de areia e já quero voltar amanhã. Alguma quadra com iluminação em Ferraz pra recomendar?',
    at: minutesAgo(60),
    imageUrl: img('kolae-areia'),
    imageAlt: 'Bia na quadra de areia',
    likes: 41,
    liked: true,
    comments: 15,
    friend: false,
  },
  {
    id: 3,
    author: xuxa,
    text: 'Sábado tem horário livre das 8h às 12h. Chama a gente pelo botão de WhatsApp na página da quadra.',
    at: minutesAgo(180),
    venue: 'Quadra do Xuxa',
    likes: 12,
    liked: false,
    comments: 3,
    friend: false,
  },
  {
    id: 4,
    author: marcos,
    text: 'Jogo pocou ontem 🔥🔥🔥 Valeu, galera da quinta!',
    at: minutesAgo(26 * 60),
    imageUrl: img('kolae-time'),
    imageAlt: 'O time depois do jogo',
    likes: 56,
    liked: true,
    comments: 13,
    friend: true,
  },
  {
    id: 5,
    author: joao,
    text: 'Quinta que vem tem revanche. Quem perdeu paga o açaí 😅',
    at: minutesAgo(2 * 24 * 60),
    venue: 'Quadra FATEC Ferraz',
    likes: 18,
    liked: false,
    comments: 6,
    friend: true,
  },
];

// Uma lista só (chave 0); "Amigos" filtra por friend.
export const postStore = createShowcaseStore<Post[]>(() => SEED);

const SAMPLE_COMMENTS: Omit<Comment, 'id' | 'at' | 'liked'>[] = [
  { author: bia, text: 'Eu topo! Chego umas 20h50.', likes: 5 },
  { author: duda, text: 'Vou levar mais um amigo, fecha os 2 que faltam 💪', likes: 3 },
  { author: lucas, text: 'Fechou! Time completo, nos vemos lá.', likes: 7 },
  { author: gabi, text: 'Da próxima me chama também!', likes: 2 },
  { author: joao, text: 'Essa quadra é muito boa, iluminação top.', likes: 4 },
  { author: marcos, text: 'Bora marcar toda semana.', likes: 1 },
  { author: duda, text: 'Alguém tem bola sobrando?', likes: 0 },
  { author: bia, text: 'Levo a minha 😉', likes: 2 },
];

// Comentários de exemplo por post (até o total que o post diz ter).
export const commentStore = createShowcaseStore<Comment[]>((postId) => {
  const total = SEED.find((p) => p.id === postId)?.comments ?? 0;
  return Array.from({ length: total }, (_, i) => ({
    ...SAMPLE_COMMENTS[(i + postId - 1) % SAMPLE_COMMENTS.length],
    id: `seed-${postId}-${i}`,
    at: minutesAgo(Math.max(1, 8 - i) + (postId - 1) * 30),
    liked: false,
  }));
});

// Sem links em posts e respostas (regra da Comunidade): http(s)://, www. ou domínio.tld.
// O domínio só conta em minúsculas, para não pegar frase sem espaço depois do ponto
// ("fim de jogo.Com chuva").
const PROTOCOL = /(https?:\/\/|www\.)\S+/i;
const DOMAIN = /\b[a-z0-9-]+\.(com|net|org|br|io|app|gg|me|co|info|xyz|site|online)(\.[a-z]{2})?\b/;
export const hasLink = (text: string) => PROTOCOL.test(text) || DOMAIN.test(text);
