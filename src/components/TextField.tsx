import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text, useInputFont } from '@/components/Text';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Campo arredondado com ícone à esquerda, como no Figma: ícone cinza, azul com foco.
// O placeholder faz o papel do label visual; "label" vai para leitores de tela.
// revealable: mostra o olho para ver/esconder a senha.
type Props = TextInputProps & { label: string; icon: IconName; error?: string; revealable?: boolean };

export function TextField({ label, icon, error, revealable, secureTextEntry, onFocus, onBlur, ...props }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const borderColor = error ? c.danger : focused ? c.primary : c.border;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.box, { borderColor, borderWidth: c.highContrast ? 2.5 : 1.5, backgroundColor: c.background }]}>
        <MaterialCommunityIcons name={icon} size={24} color={focused ? c.primary : c.textMuted} />
        <TextInput
          accessibilityLabel={label}
          placeholder={props.placeholder ?? label}
          placeholderTextColor={c.textMuted}
          style={[styles.input, { color: c.text }, inputFont]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...props}
          secureTextEntry={secureTextEntry && !revealed}
        />
        {revealable ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revealed ? t('app_hide_password') : t('app_show_password')}
            hitSlop={12}
            onPress={() => setRevealed((r) => !r)}>
            <MaterialCommunityIcons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={24} color={c.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.error, { color: c.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 4 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderRadius: 25,
    paddingHorizontal: 26,
    minHeight: 52,
  },
  input: { flex: 1, paddingVertical: 12 },
  error: { fontSize: 13, paddingHorizontal: 26 },
});
