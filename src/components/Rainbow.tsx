import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// Detalhes decorativos do tema Orgulho. Nunca recebem texto por cima: o amarelo
// não tem contraste com branco nem com preto suficiente para leitura.

// Barra horizontal com as faixas lado a lado.
export function RainbowStripe({
  colors,
  height = 4,
  style,
}: {
  colors: string[];
  height?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.stripe, { height, borderRadius: height / 2 }, style]}>
      {colors.map((color) => (
        <View key={color} style={[styles.segment, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

// Anel em volta de um círculo (avatar), cada cor num arco, começando no topo.
export function RainbowRing({ colors, size, width = 6 }: { colors: string[]; size: number; width?: number }) {
  const r = (size - width) / 2;
  const circumference = 2 * Math.PI * r;
  const arc = circumference / colors.length;
  return (
    <Svg width={size} height={size} style={StyleSheet.absoluteFill} pointerEvents="none">
      {colors.map((color, i) => (
        <Circle
          key={color}
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={width}
          fill="none"
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeDashoffset={-i * arc}
          // começa no topo (12h) em vez das 3h, sentido horário
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  stripe: { flexDirection: 'row', overflow: 'hidden' },
  segment: { flex: 1 },
});
