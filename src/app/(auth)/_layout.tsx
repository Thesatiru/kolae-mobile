import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/auth/AuthProvider';
import { usePreferences } from '@/preferences/PreferencesProvider';

// Telas para quem NÃO está logado. Se já houver sessão, vai direto para o app.
export default function AuthLayout() {
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  if (user) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, animation: motionReduced ? 'none' : 'default' }} />;
}
