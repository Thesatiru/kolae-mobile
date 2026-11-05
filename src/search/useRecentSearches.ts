import { useCallback } from 'react';

import { createUserList } from './userList';

// Últimas buscas da Pesquisar (no aparelho, por pessoa). Repetir uma busca, mesmo com outras
// maiúsculas, a traz para o topo.
const useList = createUserList<string>({
  name: 'recentSearches',
  max: 6,
  valid: (s): s is string => typeof s === 'string',
  same: (a, b) => a.toLowerCase() === b.toLowerCase(),
});

export function useRecentSearches() {
  const list = useList();
  const { add: addRaw } = list;
  const add = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (clean.length >= 2) addRaw(clean);
    },
    [addRaw],
  );
  return { ...list, add };
}

// Quadras abertas há pouco (ids), para a fileira "Vistas recentemente" da Pesquisar.
// O detalhe da quadra registra; o status vem sempre da API, nunca daqui.
export const useRecentlyViewed = createUserList<number>({
  name: 'recentlyViewed',
  max: 10,
  valid: (id): id is number => typeof id === 'number',
});
