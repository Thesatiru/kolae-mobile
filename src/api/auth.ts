import { getToken } from '@/auth/token';
import { api, MOCK_AUTH } from './client';
import { mockChangePassword, mockForgotPassword, mockLogin, mockMe, mockRegister } from './mocks/auth.mock';
import type { ApiSuccess, AuthResponse, ChangePasswordInput, LoginInput, RegisterInput, User } from './types';

// Cada função tem a versão real e a versão mock. As telas não sabem qual está em uso.

export async function login(input: LoginInput): Promise<AuthResponse> {
  if (MOCK_AUTH) return mockLogin(input);
  const res = await api.post<ApiSuccess<AuthResponse>>('/auth/login', input);
  return res.data.data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  if (MOCK_AUTH) return mockRegister(input);
  const res = await api.post<ApiSuccess<AuthResponse>>('/auth/register', input);
  return res.data.data;
}

export async function me(): Promise<User> {
  if (MOCK_AUTH) return mockMe((await getToken()) ?? '');
  const res = await api.get<ApiSuccess<User>>('/me');
  return res.data.data;
}

export async function forgotPassword(email: string): Promise<void> {
  if (MOCK_AUTH) return mockForgotPassword(email);
  await api.post('/auth/forgot-password', { email });
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  if (MOCK_AUTH) return mockChangePassword((await getToken()) ?? '', input);
  await api.put('/me/password', input);
}
