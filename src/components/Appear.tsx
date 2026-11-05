import Animated, { FadeInDown } from 'react-native-reanimated';
import type { StyleProp, ViewStyle } from 'react-native';

import { usePreferences } from '@/preferences/PreferencesProvider';

const BASE_DELAY = 120; // espera o cartão começar a subir
const STEP = 60; // intervalo entre um item e o próximo (efeito cascata)

/** Animação de entrada em cascata: o item "index" aparece um pouco depois do anterior. */
export function useAppear() {
  const { motionReduced } = usePreferences();
  return (index = 0) =>
    motionReduced ? undefined : FadeInDown.delay(BASE_DELAY + index * STEP).springify().damping(20).mass(0.8);
}

// Envolve um bloco que deve entrar subindo e aparecendo. Com movimento reduzido, entra parado.
export function Appear({ index = 0, style, children }: { index?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const appear = useAppear();
  return (
    <Animated.View entering={appear(index)} style={style}>
      {children}
    </Animated.View>
  );
}
