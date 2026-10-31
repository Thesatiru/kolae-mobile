import { Redirect, Stack, type ErrorBoundaryProps } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthProvider';
import { ErrorState } from '@/components/ErrorState';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

// Telas para quem NÃO está logado. Se já houver sessão, vai direto para o app.
export default function AuthLayout() {
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  if (user) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false, animation: motionReduced ? 'none' : 'default' }} />;
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
