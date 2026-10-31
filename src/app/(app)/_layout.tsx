import { Redirect, Stack, type ErrorBoundaryProps, router } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { ErrorState } from '@/components/ErrorState';
import { hasSeenTour } from '@/onboarding/tourStorage';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

// Área logada: abas + telas que abrem por cima delas (detalhe da quadra, tutorial).
export default function AppLayout() {
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  const userId = user?.id;

  // Primeiro login desta pessoa neste celular: abre o tutorial por cima das abas.
  useEffect(() => {
    if (userId === undefined) return;
    let active = true;
    hasSeenTour(userId).then((seen) => {
      if (active && !seen) router.push('/tour');
    });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!user) return <Redirect href="/login" />;
  return (
    <Stack screenOptions={{ headerShown: false, animation: motionReduced ? 'none' : 'default' }}>
      {/* Sem gesto de voltar: sai pelo "Pular" ou pelo "Começar", que marcam como visto. */}
      <Stack.Screen
        name="tour"
        options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: motionReduced ? 'none' : 'fade' }}
      />
      {/* Novo post da Comunidade sobe por cima, como nas redes sociais. */}
      <Stack.Screen name="post/new" options={{ presentation: 'modal', animation: motionReduced ? 'none' : 'slide_from_bottom' }} />
    </Stack>
  );
}

// Se alguma tela quebrar de vez, mostra o "Algo deu errado..." com o K em vez de fechar o app.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const c = useColors();
  if (__DEV__) console.error(error);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ErrorState error={error} onRetry={retry} variant="screen" />
    </SafeAreaView>
  );
}
