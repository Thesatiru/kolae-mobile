import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
  dot?: boolean; // bolinha antes do texto ("Disponível agora")
  floating?: boolean; // em cima do mapa: com sombra
};

export function FilterChip({ label, selected, onPress, dot, floating }: Props) {
  const c = useColors();
  const fg = selected ? c.onPrimary : c.text;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      style={[
        styles.chip,
        floating && styles.floating,
        { backgroundColor: selected ? c.primary : c.background },
        !floating && !selected && { borderWidth: 1, borderColor: c.border },
        c.highContrast && { borderWidth: 2, borderColor: c.text },
      ]}>
      {dot ? <View style={[styles.dot, { backgroundColor: selected ? c.onPrimary : c.primary }]} /> : null}
      <Text style={[styles.text, { color: fg, fontWeight: selected ? '700' : '400' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 22,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  floating: {
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  text: { fontSize: 15 },
});
