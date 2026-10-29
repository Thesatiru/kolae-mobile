import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import * as authApi from '@/api/auth';
import { SESSION_ERROR_CODES, setOnUnauthorized } from '@/api/client';
import { toApiError } from '@/api/errors';
import type { LoginInput, RegisterInput, User } from '@/api/types';
import { clearToken, getToken, saveToken } from './token';

type AuthState = {
  user: User | null;
  loading: boolean; // true enquanto verifica se já existe sessão salva
  signIn: (input: LoginInput, remember: boolean) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  // Ao abrir o app: se há token salvo, busca o usuário em /me.
  useEffect(() => {
    setOnUnauthorized(() => void signOut());
    (async () => {
      try {
        if (await getToken()) setUser(await authApi.me());
      } catch (err) {
        // Só apaga o token se ele não vale mais (D10); sem internet, tenta de novo na próxima abertura.
        if (SESSION_ERROR_CODES.has(toApiError(err).code)) await clearToken();
      } finally {
        setLoading(false);
      }
    })();
    return () => setOnUnauthorized(null);
  }, [signOut]);

  const signIn = useCallback(async (input: LoginInput, remember: boolean) => {
    const { token, user } = await authApi.login(input);
    await saveToken(token, remember);
    setUser(user);
  }, []);

  const signUp = useCallback(async (input: RegisterInput) => {
    const { token, user } = await authApi.register(input);
    await saveToken(token, true);
    setUser(user);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
