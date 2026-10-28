import { ApiRequestError } from '../errors';
import type { AuthResponse, ChangePasswordInput, LoginInput, RegisterInput, User } from '../types';
import { delay } from './delay';

// Usuário de teste: teste@kolae.com / 123456
const users: (User & { password: string })[] = [
  {
    id: 1,
    name: 'Jogador Teste',
    email: 'teste@kolae.com',
    password: '123456',
    birthdate: '2004-05-17',
    role: 'player',
    avatar_url: null,
    created_at: '2026-10-26T20:00:00-03:00',
  },
];

const strip = ({ password: _password, ...user }: User & { password: string }): User => user;
const tokenFor = (id: number) => `mock-token-${id}`;

export async function mockLogin(input: LoginInput): Promise<AuthResponse> {
  await delay();
  const user = users.find((u) => u.email === input.email.trim().toLowerCase());
  if (!user || user.password !== input.password) {
    throw new ApiRequestError(401, 'E-mail ou senha incorretos.');
  }
  return { token: tokenFor(user.id), user: strip(user) };
}

export async function mockRegister(input: RegisterInput): Promise<AuthResponse> {
  await delay();
  const errors: Record<string, string[]> = {};
  if (users.some((u) => u.email === input.email.trim().toLowerCase())) {
    errors.email = ['Este e-mail já está cadastrado. Tente fazer login.'];
  }
  if (input.password.length < 6) errors.password = ['A senha precisa ter no mínimo 6 caracteres.'];
  if (Object.keys(errors).length) throw new ApiRequestError(422, 'Dados inválidos.', errors);

  const user = {
    id: users.length + 1,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
    birthdate: input.birthdate,
    role: 'player' as const,
    avatar_url: null,
    created_at: new Date().toISOString(),
  };
  users.push(user);
  return { token: tokenFor(user.id), user: strip(user) };
}

export async function mockMe(token: string): Promise<User> {
  await delay(300);
  const user = users.find((u) => tokenFor(u.id) === token);
  if (!user) throw new ApiRequestError(401, 'Sessão expirada.');
  return strip(user);
}

export async function mockForgotPassword(_email: string): Promise<void> {
  // A API responde igual exista ou não o e-mail, para não revelar quem tem conta.
  await delay();
}

export async function mockChangePassword(token: string, input: ChangePasswordInput): Promise<void> {
  await delay();
  const user = users.find((u) => tokenFor(u.id) === token);
  if (!user) throw new ApiRequestError(401, 'Sessão expirada.');
  if (user.password !== input.current_password) {
    throw new ApiRequestError(422, 'Dados inválidos.', { current_password: ['A senha atual está incorreta.'] });
  }
  user.password = input.password;
}
