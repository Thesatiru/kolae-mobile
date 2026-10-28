import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { usePreferences } from '@/preferences/PreferencesProvider';

// Área logada: abas + telas que abrem por cima delas (detalhe da quadra).
export default function AppLayout() {
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  if (!user) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false, animation: motionReduced ? 'none' : 'default' }} />;
}
