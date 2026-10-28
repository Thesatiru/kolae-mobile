import { getToken } from '@/auth/token';
import { api, USE_MOCK } from './client';
import { mockChangePassword, mockForgotPassword, mockLogin, mockMe, mockRegister } from './mocks/auth.mock';
import type { ApiSuccess, AuthResponse, ChangePasswordInput, LoginInput, RegisterInput, User } from './types';

// Cada função tem a versão real e a versão mock. As telas não sabem qual está em uso.

export async function login(input: LoginInput): Promise<AuthResponse> {
  if (USE_MOCK) return mockLogin(input);
  const res = await api.post<ApiSuccess<AuthResponse>>('/auth/login', input);
  return res.data.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  if (USE_MOCK) return mockRegister(input);
  const res = await api.post<ApiSuccess<AuthResponse>>('/auth/register', input);
  return res.data.data;
}

export async function me(): Promise<User> {
  if (USE_MOCK) return mockMe((await getToken()) ?? '');
  const res = await api.get<ApiSuccess<User>>('/me');
  return res.data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  if (USE_MOCK) return mockForgotPassword(email);
  await api.post('/auth/forgot-password', { email });
}

// A confirmar com o João: rota e nomes dos campos. Senha atual errada = 422 em current_password.
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  if (USE_MOCK) return mockChangePassword((await getToken()) ?? '', input);
  await api.put('/me/password', input);
}
