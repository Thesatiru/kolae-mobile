import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Text, useInputFont } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import type { ThemeColors } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type TextFieldRef = React.ComponentRef<typeof TextInput>;

/**
 * Caixa dos campos (também usada no DateField): fundo preenchido e borda só no foco ou no erro.
 * No Alto contraste o fundo é igual ao da tela, então a borda grossa fica sempre.
 */
export function fieldBoxStyle(c: ThemeColors, focused: boolean, error: boolean): ViewStyle {
  const accent = error ? c.danger : focused ? c.primary : null;
  return {
    backgroundColor: c.surface,
    borderWidth: c.highContrast ? 2.5 : 2,
    borderColor: accent ?? (c.highContrast ? c.border : c.surface),
  };
}

/** Texto de erro embaixo de um campo; entra com um fade (ou parado, com movimento reduzido). */
export function FieldError({ message }: { message?: string }) {
  const c = useColors();
  const { motionReduced } = usePreferences();
  if (!message) return null;
  return (
    <Animated.View entering={motionReduced ? undefined : FadeIn.duration(200)} style={styles.errorRow}>
      <MaterialCommunityIcons name="alert-circle-outline" size={16} color={c.danger} />
      <Text accessibilityLiveRegion="polite" accessibilityRole="alert" style={[styles.error, { color: c.danger }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

// Campo com ícone à esquerda e rótulo sempre visível acima (um placeholder sumiria ao digitar).
// Tocar em qualquer parte da caixa foca o campo. revealable: o olho para ver/esconder a senha.
// hint: texto de ajuda embaixo, trocado pelo erro quando houver.
// ref: para o "próximo" do teclado focar o campo seguinte (returnKeyType="next").
type Props = TextInputProps & {
  label: string;
  icon: IconName;
  error?: string;
  hint?: string;
  revealable?: boolean;
  ref?: React.Ref<TextFieldRef>;
};

export function TextField({ label, icon, error, hint, revealable, secureTextEntry, onFocus, onBlur, ref, ...props }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);
  const inner = useRef<TextFieldRef | null>(null);
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function setRefs(node: TextFieldRef | null) {
    inner.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as React.RefObject<TextFieldRef | null>).current = node;
  }

  return (
    <View style={styles.wrapper}>
      {/* Escondido do leitor de tela: o próprio campo já anuncia o rótulo (accessibilityLabel). */}
      <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.label, { color: c.text }]}>
        {label}
      </Text>
      <Pressable
        accessible={false}
        onPress={() => inner.current?.focus()}
        style={[styles.box, fieldBoxStyle(c, focused, !!error)]}>
        <MaterialCommunityIcons name={icon} size={22} color={error ? c.danger : focused ? c.primary : c.textMuted} />
        <TextInput
          ref={setRefs}
          accessibilityLabel={label}
          accessibilityHint={error ? undefined : hint}
          placeholderTextColor={c.textMuted}
          selectionColor={c.primary}
          cursorColor={c.primary}
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
            <MaterialCommunityIcons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={22} color={c.textMuted} />
          </Pressable>
        ) : null}
      </Pressable>
      {error ? (
        <FieldError message={error} />
      ) : hint ? (
        <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.hint, { color: c.textMuted }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  label: { fontSize: 14, fontWeight: '600', paddingHorizontal: 2 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  input: { flex: 1, paddingVertical: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  error: { flex: 1, fontSize: 13 },
  hint: { fontSize: 13, paddingHorizontal: 2 },
});
