import { getToken } from '@/auth/token';
import { api, MOCK_AUTH } from './client';
import {
  mockChangePassword,
  mockForgotPassword,
  mockLogin,
  mockMe,
  mockRegister,
  mockUpdateMe,
  mockUploadAvatar,
} from './mocks/auth.mock';
import type {
  ApiSuccess,
  AuthResponse,
  ChangePasswordInput,
  LoginInput,
  RegisterInput,
  UpdateMeInput,
  UploadFile,
  User,
} from './types';

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

/** Edita o nome (PATCH /me). Devolve o user atualizado. */
export async function updateMe(input: UpdateMeInput): Promise<User> {
  if (MOCK_AUTH) return mockUpdateMe((await getToken()) ?? '', input);
  const res = await api.patch<ApiSuccess<User>>('/me', input);
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

/** Envia ou troca a foto de perfil (JPG, PNG ou GIF de até 10 MB). Devolve o user com o novo avatar_url. */
export async function uploadAvatar(file: UploadFile): Promise<User> {
  if (MOCK_AUTH) return mockUploadAvatar((await getToken()) ?? '', file);
  const form = new FormData();
  // No React Native o arquivo vai como { uri, name, type }; o celular lê e envia o conteúdo.
  form.append('avatar', file as unknown as Blob);
  const res = await api.post<ApiSuccess<User>>('/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' }, // o padrão do cliente é JSON
    transformRequest: (data) => data, // não deixa o axios transformar o FormData em JSON
  });
  return res.data.data;
}
