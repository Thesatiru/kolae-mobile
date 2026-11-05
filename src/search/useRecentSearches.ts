import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/auth/AuthProvider';

const MAX = 6;
const key = (userId: number) => `kolae.recentSearches.${userId}`;

function parse(raw: string | null): string[] {
  try {
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string').slice(0, MAX) : [];
  } catch {
    return []; // dado estragado: começa vazio em vez de quebrar
  }
}

// Últimas buscas da Pesquisar, só no aparelho e separadas por pessoa (como os favoritos).
// Não vão para a API. A mais recente fica primeiro; repetir uma busca a traz para o topo.
export function useRecentSearches() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    if (userId === null) return;
    let active = true;
    AsyncStorage.getItem(key(userId))
      .catch(() => null)
      .then((raw) => active && setItems(parse(raw)));
    return () => {
      active = false;
    };
  }, [userId]);

  const save = useCallback(
    (next: string[]) => {
      setItems(next);
      if (userId !== null) AsyncStorage.setItem(key(userId), JSON.stringify(next)).catch(() => {});
    },
    [userId],
  );

  const add = useCallback(
    (term: string) => {
      const clean = term.trim();
      if (clean.length < 2) return;
      save([clean, ...items.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, MAX));
    },
    [items, save],
  );

  const remove = useCallback((term: string) => save(items.filter((s) => s !== term)), [items, save]);
  const clear = useCallback(() => save([]), [save]);

  return { items, add, remove, clear };
}
