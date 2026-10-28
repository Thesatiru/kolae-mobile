import { useSyncExternalStore } from 'react';

// Guarda simples em memória para as telas de vitrine: o que a pessoa faz (mensagens,
// avaliações) dura enquanto o app está aberto, mesmo saindo e voltando para a tela.
export function createShowcaseStore<T>(seed: (key: number) => T) {
  const data = new Map<number, T>();
  const listeners = new Set<() => void>();

  const get = (key: number) => {
    if (!data.has(key)) data.set(key, seed(key));
    return data.get(key)!;
  };
  const set = (key: number, update: (current: T) => T) => {
    data.set(key, update(get(key)));
    listeners.forEach((l) => l());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  function useValue(key: number) {
    return useSyncExternalStore(subscribe, () => get(key));
  }

  return { get, set, useValue };
}
