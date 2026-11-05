import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withTiming, type SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { usePreferences } from '@/preferences/PreferencesProvider';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Quadra vista de cima (viewBox 400 x 240): contorno, meio, círculo central e as duas áreas.
// Cada traço tem o seu comprimento, para o "desenho" (strokeDashoffset) andar na mesma velocidade.
const W = 400;
const H = 240;
const M = 10; // margem do contorno
const AREA = { w: 64, h: 120 };
const CENTER_R = 34;
const OUTLINE = 2 * (W - 2 * M) + 2 * (H - 2 * M);
const MIDLINE = H - 2 * M;
const CIRCLE = 2 * Math.PI * CENTER_R;
const AREA_LEN = 2 * AREA.w + AREA.h;

const DRAW_MS = 1400;

function useDash(progress: SharedValue<number>, length: number) {
  return useAnimatedProps(() => ({ strokeDashoffset: length * (1 - progress.value) }));
}

// Decoração do topo das telas de entrada: linhas de quadra que se desenham ao abrir.
// Escondida do leitor de tela. Com movimento reduzido, aparece já desenhada.
export function CourtLines({ color, opacity = 0.18 }: { color: string; opacity?: number }) {
  const { motionReduced } = usePreferences();
  const progress = useSharedValue(motionReduced ? 1 : 0);

  useEffect(() => {
    if (motionReduced) return;
    progress.value = withDelay(150, withTiming(1, { duration: DRAW_MS, easing: Easing.inOut(Easing.cubic) }));
  }, [motionReduced, progress]);

  const outline = useDash(progress, OUTLINE);
  const midline = useDash(progress, MIDLINE);
  const circle = useDash(progress, CIRCLE);
  const area = useDash(progress, AREA_LEN);

  const stroke = { stroke: color, strokeWidth: 3, fill: 'none', strokeLinecap: 'round' as const };
  const areaTop = (H - AREA.h) / 2;

  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.wrap, { opacity }]}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <AnimatedRect x={M} y={M} width={W - 2 * M} height={H - 2 * M} rx={6} strokeDasharray={OUTLINE} animatedProps={outline} {...stroke} />
        <AnimatedLine x1={W / 2} y1={M} x2={W / 2} y2={H - M} strokeDasharray={MIDLINE} animatedProps={midline} {...stroke} />
        <AnimatedCircle cx={W / 2} cy={H / 2} r={CENTER_R} strokeDasharray={CIRCLE} animatedProps={circle} {...stroke} />
        {/* Áreas: três lados, abertas para a linha de fundo (o 4º lado é o contorno). */}
        <AnimatedPath d={`M ${M} ${areaTop} H ${M + AREA.w} V ${areaTop + AREA.h} H ${M}`} strokeDasharray={AREA_LEN} animatedProps={area} {...stroke} />
        <AnimatedPath d={`M ${W - M} ${areaTop} H ${W - M - AREA.w} V ${areaTop + AREA.h} H ${W - M}`} strokeDasharray={AREA_LEN} animatedProps={area} {...stroke} />
        <Circle cx={W / 2} cy={H / 2} r={4} fill={color} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  // Maior que o topo e inclinada: a quadra "vaza" pelas bordas, como um fundo, não como um desenho.
  wrap: { position: 'absolute', top: -40, left: -60, right: -60, bottom: -40, transform: [{ rotate: '-12deg' }] },
});
