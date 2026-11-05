import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { useAuth } from '@/auth/AuthProvider';

type Options<T> = {
  name: string; // vira a chave "kolae.<name>.<userId>" no AsyncStorage
  max: number; // guarda só os mais recentes
  valid: (item: unknown) => item is T; // descarta o que estiver estragado no aparelho
  same?: (a: T, b: T) => boolean; // repetido volta para o topo em vez de duplicar
};

// Lista "mais recentes primeiro", salva no aparelho e separada por pessoa (como os favoritos),
// compartilhada entre as telas: o detalhe da quadra registra e a Pesquisar vê na hora.
// Não vai para a API.
export function createUserList<T>({ name, max, valid, same = (a, b) => a === b }: Options<T>) {
  const EMPTY: T[] = [];
  const cache = new Map<string, T[]>();
  const pending = new Map<string, Promise<T[]>>();
  const listeners = new Set<() => void>();

  const storageKey = (userId: number) => `kolae.${name}.${userId}`;
  const emit = () => listeners.forEach((l) => l());
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function parse(raw: string | null): T[] {
    try {
      const list: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.filter(valid).slice(0, max) : [];
    } catch {
      return []; // dado estragado: começa vazio em vez de quebrar
    }
  }

  // Lê do aparelho uma vez por pessoa; quem pedir antes de terminar espera a mesma leitura.
  function ensure(key: string): Promise<T[]> {
    const cached = cache.get(key);
    if (cached) return Promise.resolve(cached);
    let promise = pending.get(key);
    if (!promise) {
      promise = AsyncStorage.getItem(key)
        .catch(() => null)
        .then((raw) => {
          const list = cache.get(key) ?? parse(raw);
          cache.set(key, list);
          pending.delete(key);
          emit();
          return list;
        });
      pending.set(key, promise);
    }
    return promise;
  }

  function write(key: string, next: T[]) {
    cache.set(key, next);
    emit();
    AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => {});
  }

  return function useUserList() {
    const { user } = useAuth();
    const key = user ? storageKey(user.id) : null;

    useEffect(() => {
      if (key) void ensure(key);
    }, [key]);

    const items = useSyncExternalStore(subscribe, () => (key ? (cache.get(key) ?? EMPTY) : EMPTY));

    const add = useCallback(
      (item: T) => {
        if (!key) return;
        void ensure(key).then((cur) => write(key, [item, ...cur.filter((x) => !same(x, item))].slice(0, max)));
      },
      [key],
    );
    const remove = useCallback(
      (item: T) => {
        if (key) void ensure(key).then((cur) => write(key, cur.filter((x) => !same(x, item))));
      },
      [key],
    );
    const clear = useCallback(() => {
      if (key) write(key, []);
    }, [key]);

    return { items, add, remove, clear };
  };
}
