import '@/i18n';
import '@/network/online';

import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { Kanit_400Regular, Kanit_500Medium, Kanit_700Bold, useFonts } from '@expo-google-fonts/kanit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Slot, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { AuthProvider, useAuth } from '@/auth/AuthProvider';
import { BrandSplash } from '@/components/BrandSplash';
import { ToastProvider } from '@/components/Toast';
import { FavoritesProvider } from '@/favorites/FavoritesProvider';
import { OfflineBanner } from '@/network/OfflineBanner';
import { PreferencesProvider, usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

// Segura a splash nativa (azul) até a nossa BrandSplash estar pronta para assumir.
SplashScreen.preventAutoHideAsync();

const SPLASH_MIN_MS = 1200; // tempo mínimo da marca na tela, sem travar o app à toa

const queryClient = new QueryClient({
  // Ao reconectar, recarrega as telas abertas mesmo que os dados ainda não estejam "velhos".
  defaultOptions: { queries: { retry: 1, staleTime: 60_000, refetchOnReconnect: 'always' } },
});

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loading } = useAuth();
  const { ready: prefsReady } = usePreferences();
  const c = useColors();
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null; // a splash nativa ainda está na tela
  // Espera as preferências para não piscar o tema padrão antes do escolhido.
  if (loading || !prefsReady || !minElapsed) return <BrandSplash />;
  return (
    <ThemeProvider value={c.scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={c.scheme === 'dark' ? 'light' : 'dark'} />
      <ToastProvider>
        <Slot />
        <OfflineBanner />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kanit_400Regular,
    Kanit_500Medium,
    Kanit_700Bold,
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_700Bold,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <AuthProvider>
          <FavoritesProvider>
            <RootNavigator fontsLoaded={fontsLoaded} />
          </FavoritesProvider>
        </AuthProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}
