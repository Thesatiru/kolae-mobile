import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { Text } from '@/components/Text';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  compact?: boolean;
  icon?: IconName;
  accessibilityHint?: string; // o que acontece ao tocar, quando não é óbvio (ex.: abre outro app)
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', compact, icon, accessibilityHint }: Props) {
  const c = useColors();
  const primary = variant === 'primary';
  const outline = variant === 'outline';
  const danger = variant === 'danger';
  const color = primary ? c.onPrimary : outline ? c.textMuted : danger ? c.danger : c.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact ? styles.compact : styles.full,
        primary && { backgroundColor: c.primary },
        outline && { borderWidth: 1.5, borderColor: c.divider },
        danger && { borderWidth: 1.5, borderColor: c.danger },
        { opacity: disabled ? 0.45 : pressed || loading ? 0.75 : 1 },
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? c.onPrimary : c.primary} />
      ) : (
        <>
          {icon ? <MaterialCommunityIcons name={icon} size={compact ? 20 : 22} color={color} /> : null}
          <Text
            style={[
              compact ? styles.textCompact : styles.text,
              outline && styles.textOutline,
              { color },
            ]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  full: { width: '100%', minHeight: 54 },
  compact: { paddingVertical: 13, paddingHorizontal: 28 },
  text: { fontSize: 22, fontFamily: fonts.medium },
  textCompact: { fontSize: 17, fontFamily: fonts.medium },
  textOutline: { fontSize: 16, fontFamily: fonts.regular },
});
