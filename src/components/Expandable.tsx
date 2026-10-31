import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Animated, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline, type ThemeColors } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  icon: IconName;
  title: string;
  description: string;
  hint?: string; // dica do leitor de tela (ex.: "Toque duas vezes para ver os detalhes")
  colors?: ThemeColors; // outra paleta, ex.: a escura dentro do cartão do Pro
};

/**
 * Balão que abre: ícone, título e seta; ao tocar, mostra a descrição embaixo e a seta gira.
 * Cada balão abre e fecha sozinho (vários podem ficar abertos). Começa fechado.
 */
export function Expandable({ icon, title, description, hint, colors }: Props) {
  const themed = useColors();
  const c = colors ?? themed;
  const { motionReduced } = usePreferences();
  const [open, setOpen] = useState(false);
  const [rotation] = useState(() => new Animated.Value(0));

  function toggle() {
    const next = !open;
    if (!motionReduced) LayoutAnimation.configureNext(LayoutAnimation.create(180, 'easeInEaseOut', 'opacity'));
    Animated.timing(rotation, { toValue: next ? 1 : 0, duration: motionReduced ? 0 : 180, useNativeDriver: true }).start();
    setOpen(next);
  }

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={[styles.box, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={hint}
        onPress={toggle}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
        <MaterialCommunityIcons name={icon} size={22} color={c.link} accessibilityElementsHidden importantForAccessibility="no" />
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <MaterialCommunityIcons name="chevron-down" size={24} color={c.textMuted} />
        </Animated.View>
      </Pressable>
      {open ? <Text style={[styles.description, { color: c.textMuted }]}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, minHeight: 52 },
  title: { flex: 1, fontSize: 16, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 21, paddingLeft: 48, paddingRight: 16, paddingBottom: 16 },
});
