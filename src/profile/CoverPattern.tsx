import { StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/Logo';
import { useColors } from '@/theme/useColors';

/** Capa padrão: o K do Kolae repetido sobre um fundo claro do tema (arco-íris no Orgulho). */
export function CoverPattern({ width, height }: { width: number; height: number }) {
  const c = useColors();
  const size = 34;
  const gapX = 60;
  const rows = Math.ceil(height / 52) + 1;
  const cols = Math.ceil(width / gapX) + 1;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, styles.pattern, { backgroundColor: c.surface }]}>
      {Array.from({ length: rows }, (_, r) => (
        <View key={r} style={[styles.patternRow, { marginLeft: r % 2 ? gapX / 2 : 0 }]}>
          {Array.from({ length: cols }, (_, i) => (
            <View key={i} style={{ width: gapX, opacity: c.rainbow ? 0.45 : 0.22 }}>
              <LogoMark color={c.primary} colors={c.rainbow} height={size} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pattern: { overflow: 'hidden', paddingTop: 6, gap: 18 },
  patternRow: { flexDirection: 'row' },
});
