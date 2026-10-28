import { createContext, useContext } from 'react';
import { StyleSheet, Text as RNText, type TextProps, type TextStyle } from 'react-native';

import { usePreferences } from '@/preferences/PreferencesProvider';
import { readableFamily } from '@/theme/fonts';

// Tamanho padrão do RN quando o estilo não define fontSize.
const DEFAULT_FONT_SIZE = 14;
// Com a fonte de leitura fácil: um pouco mais de espaço entre letras e entre linhas.
const READABLE_LETTER_SPACING = 0.3;
const READABLE_LINE_HEIGHT = 1.45;

// Texto dentro de texto herda o tamanho do pai; só o de fora aplica a escala.
const InsideText = createContext(false);

/** Fator de "Tamanho do texto" (Configurações › Aparência), para quem não usa <Text> (ex.: TextInput). */
export function useFontScale() {
  return usePreferences().fontScale;
}

/** Estilo de fonte para TextInput: tamanho escalado e, se ligada, a fonte de leitura fácil. */
export function useInputFont(fontSize: number): TextStyle {
  const { fontScale, readableFont } = usePreferences();
  return {
    fontSize: fontSize * fontScale,
    ...(readableFont ? { fontFamily: readableFamily(undefined, undefined), letterSpacing: READABLE_LETTER_SPACING } : null),
  };
}

// Use no lugar do Text do react-native: aplica o tamanho escolhido no app por cima
// do tamanho de fonte do sistema (que o RN já respeita sozinho) e a fonte de leitura fácil.
export function Text({ style, children, ...props }: TextProps) {
  const { fontScale: scale, readableFont } = usePreferences();
  const nested = useContext(InsideText);
  const flat = StyleSheet.flatten(style) ?? {};

  const extra: { -readonly [K in keyof TextStyle]: TextStyle[K] } = {};
  const ownsSize = flat.fontSize !== undefined || !nested;
  const fontSize = (flat.fontSize ?? DEFAULT_FONT_SIZE) * scale;
  if (scale !== 1 && ownsSize) {
    extra.fontSize = fontSize;
    if (flat.lineHeight !== undefined) extra.lineHeight = flat.lineHeight * scale;
  }
  if (readableFont) {
    extra.fontFamily = readableFamily(flat.fontFamily, flat.fontWeight);
    extra.fontWeight = 'normal'; // o peso já está na família; evita negrito "falso" no Android
    extra.letterSpacing = READABLE_LETTER_SPACING;
    if (ownsSize && flat.lineHeight === undefined) extra.lineHeight = Math.round(fontSize * READABLE_LINE_HEIGHT);
  }

  return (
    <RNText {...props} style={Object.keys(extra).length ? [style, extra] : style}>
      <InsideText.Provider value>{children}</InsideText.Provider>
    </RNText>
  );
}
