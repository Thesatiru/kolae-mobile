import * as Haptics from 'expo-haptics';

// Ponto único da vibração do app: toda vibração passa por aqui (nunca chamar expo-haptics
// direto nas telas). A opção "Vibração" (Configurações › Aparência) desliga tudo de uma vez:
// o PreferencesProvider avisa por setHapticsEnabled quando ela muda.
let enabled = true;

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

/** Toque leve de seleção: chip, filtro, item da roleta, dia da agenda. */
export function tick() {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}

/** Toque um pouco mais marcado, para uma ação que "fica": favoritar. */
export function tap() {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}
