import axios from 'axios';

import { getToken } from '@/auth/token';
import i18n from '@/i18n';
import { toApiError } from './errors';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
// Mock por área: dá para usar o login real com as quadras ainda falsas (ou o contrário).
export const MOCK_AUTH = process.env.EXPO_PUBLIC_MOCK_AUTH === 'true';
export const MOCK_VENUES = process.env.EXPO_PUBLIC_MOCK_VENUES === 'true';
/** Alguma área usa dados falsos: mostra o aviso de modo de teste. */
export const ANY_MOCK = MOCK_AUTH || MOCK_VENUES;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

// Erros de token (D10): só neles a sessão acabou. INVALID_CREDENTIALS é só senha errada no login.
export const SESSION_ERROR_CODES = new Set([
  'AUTH_MISSING_TOKEN',
  'AUTH_INVALID_FORMAT',
  'AUTH_TOKEN_EXPIRED',
  'AUTH_INVALID_TOKEN',
  'AUTH_INVALID_USER',
]);

// O AuthProvider registra aqui o que fazer quando o token não vale mais.
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
    if (SESSION_ERROR_CODES.has(apiError.code)) onUnauthorized?.();
    return Promise.reject(apiError);
  },
);
