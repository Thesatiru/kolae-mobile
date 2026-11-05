import { useEffect, useState } from 'react';
import { Animated, Appearance, Easing, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LogoMark } from './Logo';

// Mesmas cores e tamanho da splash nativa (app.config.ts, expo-splash-screen): a troca de uma
// para a outra fica invisível. Hex fixo de propósito: aqui o tema escolhido ainda não carregou.
const SPLASH_BG = { light: '#0084FF', dark: '#121417' };
const SPLASH_MARK_HEIGHT = 75; // imageWidth 76 do splash-icon.png (400 px, símbolo com 394 de altura)
const FADE_MS = 280;
// Lido quando o módulo carrega, antes de as preferências aplicarem o modo escolhido
// (Appearance.setColorScheme): é o modo do sistema, o mesmo que a splash nativa usou.
const SYSTEM_SCHEME = Appearance.getColorScheme();

type Props = {
  leaving: boolean; // true quando o app está pronto: a splash some com um fade
  onHidden: () => void; // chamado no fim do fade, para desmontar a splash
  motionReduced: boolean;
};

// Continuação da splash nativa por cima do app, enquanto sessão e preferências carregam.
// O símbolo "respira" de leve enquanto espera; com movimento reduzido, nada se mexe.
export function BrandSplash({ leaving, onHidden, motionReduced }: Props) {
  const { t } = useTranslation();
  const [opacity] = useState(() => new Animated.Value(1));
  const [pulse] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (motionReduced || leaving) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.55, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    // Só começa a pulsar se o carregamento demorar: abertura rápida não vira pisca-pisca.
    const timer = setTimeout(() => loop.start(), 400);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [leaving, motionReduced, pulse]);

  useEffect(() => {
    if (!leaving) return;
    if (motionReduced) return onHidden();
    Animated.timing(opacity, { toValue: 0, duration: FADE_MS, easing: Easing.out(Easing.ease), useNativeDriver: true }).start(
      ({ finished }) => finished && onHidden(),
    );
  }, [leaving, motionReduced, onHidden, opacity]);

  return (
    <Animated.View
      accessible
      accessibilityLabel={t('app_splash_welcome')}
      pointerEvents={leaving ? 'none' : 'auto'}
      style={[styles.container, { backgroundColor: SPLASH_BG[SYSTEM_SCHEME === 'dark' ? 'dark' : 'light'], opacity }]}>
      <Animated.View style={{ opacity: pulse }}>
        <LogoMark color="#FFFFFF" height={SPLASH_MARK_HEIGHT} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
});
