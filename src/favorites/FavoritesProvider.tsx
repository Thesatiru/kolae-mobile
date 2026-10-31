import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/auth/AuthProvider';

// Favoritos são vitrine (D04): não há endpoint nem tabela para isso, então ficam só no aparelho,
// separados por usuário (quem entrar com outra conta no mesmo celular não vê os seus).
// Quando o backend tiver (ex.: POST/DELETE /venues/{id}/favorite), troque aqui.
type FavoritesState = {
  ids: Set<number>;
  isFavorite: (id: number) => boolean;
  toggle: (id: number) => void;
};

type Stored = { userId: number | null; ids: Set<number>; changed: boolean };

const FavoritesContext = createContext<FavoritesState | null>(null);
const EMPTY = new Set<number>();
const key = (userId: number) => `kolae.favorites.${userId}`;

function parse(raw: string | null): Set<number> {
  try {
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((id): id is number => typeof id === 'number') : []);
  } catch {
    return new Set(); // dado estragado: começa vazio em vez de quebrar
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [stored, setStored] = useState<Stored>({ userId: null, ids: EMPTY, changed: false });

  // Ao entrar (ou trocar de conta), carrega os favoritos dessa pessoa.
  useEffect(() => {
    if (userId === null) return;
    let active = true;
    AsyncStorage.getItem(key(userId))
      .catch(() => null)
      .then((raw) => {
        if (active) setStored({ userId, ids: parse(raw), changed: false });
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Salva só o que a pessoa mudou (não regrava o que acabou de ser lido).
  useEffect(() => {
    if (stored.userId === null || !stored.changed) return;
    AsyncStorage.setItem(key(stored.userId), JSON.stringify([...stored.ids])).catch(() => {});
  }, [stored]);

  // Enquanto os da conta atual não carregam, não mostra os da conta anterior.
  const ids = stored.userId === userId ? stored.ids : EMPTY;

  const toggle = useCallback(
    (id: number) => {
      if (userId === null) return;
      setStored((prev) => {
        const next = new Set(prev.userId === userId ? prev.ids : EMPTY);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return { userId, ids: next, changed: true };
      });
    },
    [userId],
  );

  const value = useMemo(() => ({ ids, isFavorite: (id: number) => ids.has(id), toggle }), [ids, toggle]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites precisa estar dentro de <FavoritesProvider>');
  return ctx;
}
