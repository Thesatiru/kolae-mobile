import { usePreferences } from '@/preferences/PreferencesProvider';
import { palette } from './colors';

export function useColors() {
  const { themeColor, activeScheme } = usePreferences();
  return palette[themeColor][activeScheme];
}

/** Versão escura do tema escolhido, mesmo no modo claro (ex.: o cartão escuro do Kolae Pro). */
export function useDarkColors() {
  const { themeColor } = usePreferences();
  return palette[themeColor].dark;
}
