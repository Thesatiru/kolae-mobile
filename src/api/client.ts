import axios from 'axios';

import { getToken } from '@/auth/token';
import i18n from '@/i18n';
import { toApiError } from './errors';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
export const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// O AuthProvider registra aqui o que fazer quando o token expira (401).
let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(fn: (() => void) | null) {
  onUnauthorized = fn;
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  // Para a API responder mensagens de erro no idioma do app (se o backend suportar).
  config.headers['Accept-Language'] = i18n.language;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = toApiError(error);
    // 401 em rota autenticada = sessão expirada. No login, é só senha errada.
    const isLogin = error?.config?.url?.includes('/auth/login');
    if (apiError.status === 401 && !isLogin) onUnauthorized?.();
    return Promise.reject(apiError);
  },
);
