import { Redirect, Stack, router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/auth/AuthProvider';
import { hasSeenTour } from '@/onboarding/tourStorage';
import { usePreferences } from '@/preferences/PreferencesProvider';

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
    </Stack>
  );
}
