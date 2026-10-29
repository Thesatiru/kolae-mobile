import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Appearance, useColorScheme } from 'react-native';

import i18n, { deviceLanguage, type Language } from '@/i18n';
import { THEME_COLORS, type ThemeColor, type ThemeMode } from '@/theme/colors';

const KEY = 'kolae_prefs';

// Preferências reais, salvas no aparelho.
type Saved = {
  themeColor: ThemeColor;
  themeMode: ThemeMode; // 'system' = claro/escuro conforme o celular
  readableFont: boolean; // Atkinson Hyperlegible no lugar da Kanit/fonte do sistema
  language: Language | null; // null = idioma do celular
  textSize: number; // índice em TEXT_SCALES
  reduceMotion: boolean;
  useLocation: boolean; // "Usar minha localização" (Configurações › Gerais)
};

// Pequeno, Padrão, Grande, Muito grande. Multiplica por cima do tamanho de fonte do sistema.
export const TEXT_SCALES = [0.9, 1, 1.15, 1.3];

// Vitrine (só visual): ficam na memória enquanto o app está aberto.
export type ShowcaseToggle =
  | 'pauseNotifications'
  | 'notifyNearbyMatches'
  | 'notifyMatchReminder'
  | 'notifyNews'
  | 'photosOnWifi'
  | 'publicProfile'
  | 'showMatches';

const DEFAULT_SAVED: Saved = {
  themeColor: 'kolae',
  themeMode: 'light',
  readableFont: false,
  language: null,
  textSize: 1,
  reduceMotion: false,
  useLocation: true,
};

// Versões antigas salvavam { theme: 'kolae' | 'light' | 'dark' | cor, followSystem }.
type LegacySaved = Partial<Saved> & { theme?: string; followSystem?: boolean };

function migrate(raw: LegacySaved): Saved {
  const { theme, followSystem, ...rest } = raw;
  const next: Saved = { ...DEFAULT_SAVED, ...rest };
  if (theme !== undefined && raw.themeColor === undefined) {
    if (theme === 'light') next.themeColor = 'neutral';
    else if (theme === 'dark') next.themeMode = 'dark';
    else if ((THEME_COLORS as string[]).includes(theme)) next.themeColor = theme as ThemeColor;
  }
  if (followSystem && raw.themeMode === undefined) next.themeMode = 'system';
  if (!THEME_COLORS.includes(next.themeColor)) next.themeColor = 'kolae';
  return next;
}

const DEFAULT_SHOWCASE: Record<ShowcaseToggle, boolean> = {
  pauseNotifications: true,
  notifyNearbyMatches: true,
  notifyMatchReminder: true,
  notifyNews: false,
  photosOnWifi: false,
  publicProfile: true,
  showMatches: true,
};

type PreferencesState = Saved & {
  ready: boolean;
  activeScheme: 'light' | 'dark'; // modo em uso de fato (resolve o "automático")
  fontScale: number;
  motionReduced: boolean; // opção do app OU "remover animações" do sistema
  setThemeColor: (color: ThemeColor) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setReadableFont: (on: boolean) => void;
  setLanguage: (language: Language) => void;
  setTextSize: (index: number) => void;
  setReduceMotion: (reduce: boolean) => void;
  setUseLocation: (on: boolean) => void;
  showcase: Record<ShowcaseToggle, boolean>;
  setShowcase: (key: ShowcaseToggle, value: boolean) => void;
};

const PreferencesContext = createContext<PreferencesState | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Saved>(DEFAULT_SAVED);
  const [ready, setReady] = useState(false);
  const [showcase, setShowcaseState] = useState(DEFAULT_SHOWCASE);
  const systemScheme = useColorScheme();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setSystemReduceMotion);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((raw) => {
        if (raw) setSaved(migrate(JSON.parse(raw)));
      })
      .catch(() => {}) // preferência corrompida: fica no padrão
      .finally(() => setReady(true));
  }, []);

  const update = useCallback((patch: Partial<Saved>) => {
    setSaved((cur) => {
      const next = { ...cur, ...patch };
      SecureStore.setItemAsync(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // No automático o app volta a ouvir o sistema; senão, força claro/escuro
  // para que abas, switches e alertas nativos combinem com o modo escolhido.
  useEffect(() => {
    if (!ready) return;
    Appearance.setColorScheme(saved.themeMode === 'system' ? 'auto' : saved.themeMode);
  }, [ready, saved.themeMode]);

  useEffect(() => {
    if (ready) i18n.changeLanguage(saved.language ?? deviceLanguage());
  }, [ready, saved.language]);

  const activeScheme =
    saved.themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : saved.themeMode;

  const value = useMemo<PreferencesState>(
    () => ({
      ...saved,
      ready,
      activeScheme,
      setThemeColor: (themeColor) => update({ themeColor }),
      setThemeMode: (themeMode) => update({ themeMode }),
      setReadableFont: (readableFont) => update({ readableFont }),
      setLanguage: (language) => update({ language }),
      setTextSize: (textSize) => update({ textSize }),
      setReduceMotion: (reduceMotion) => update({ reduceMotion }),
      setUseLocation: (useLocation) => update({ useLocation }),
      fontScale: TEXT_SCALES[saved.textSize] ?? 1,
      motionReduced: saved.reduceMotion || systemReduceMotion,
      showcase,
      setShowcase: (key, v) => setShowcaseState((cur) => ({ ...cur, [key]: v })),
    }),
    [saved, ready, activeScheme, systemReduceMotion, showcase, update],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences precisa estar dentro de <PreferencesProvider>');
  return ctx;
}
