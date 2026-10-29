import { createShowcaseStore } from './store';

// Vitrine: avaliações não existem na API (D04). Nota, total, lista e barras saem daqui.

export type Review = { id: string; author: string; rating: number; text: string; at: string; mine?: boolean };

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

const SAMPLE: Omit<Review, 'id' | 'at'>[] = [
  { author: 'Ana Souza', rating: 5, text: 'Quadra muito bem cuidada e o responsável é super atencioso. Voltaremos!' },
  { author: 'Lucas Pereira', rating: 5, text: 'Iluminação ótima, deu para jogar até tarde sem problema.' },
  { author: 'Bia Lima', rating: 4, text: 'Gostei bastante. Só o vestiário que poderia ser maior.' },
  { author: 'Rafa Gomes', rating: 5, text: 'Melhor quadra da região. Preço justo.' },
  { author: 'Duda Martins', rating: 3, text: 'Boa quadra, mas o horário que eu queria estava sempre ocupado.' },
  { author: 'Gabi Rocha', rating: 4, text: 'Fácil de chegar e bem localizada. Recomendo.' },
];

export const reviewStore = createShowcaseStore<Review[]>((venueId) =>
  // gira a lista pelo id para cada quadra ter uma ordem diferente
  SAMPLE.map((_, i) => ({
    ...SAMPLE[(i + venueId) % SAMPLE.length],
    id: `seed-${venueId}-${i}`,
    at: daysAgo(3 + i * 6),
  })),
);

/** Média e total das avaliações de exemplo (inclui as que a pessoa escreveu no app). */
export function summarizeReviews(reviews: Review[]): { rating: number | null; count: number } {
  if (!reviews.length) return { rating: null, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { rating: Math.round((sum / reviews.length) * 10) / 10, count: reviews.length };
}
