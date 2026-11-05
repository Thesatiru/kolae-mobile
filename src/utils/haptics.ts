import * as Haptics from 'expo-haptics';

// Ponto único da vibração do app: toda vibração passa por aqui, para a opção "Vibração" das
// Configurações (pendência) desligar tudo de uma vez.

/** Toque leve de seleção: chip, filtro, item da roleta. */
export function tick() {
  Haptics.selectionAsync().catch(() => {});
}
