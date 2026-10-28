import { usePreferences } from '@/preferences/PreferencesProvider';
import { palette } from './colors';

export function useColors() {
  const { themeColor, activeScheme } = usePreferences();
  return palette[themeColor][activeScheme];
}
