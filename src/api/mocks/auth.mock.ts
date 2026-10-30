import { isOldEnough, PASSWORD_MIN_LENGTH } from '@/auth/rules';
import { ApiRequestError } from '../errors';
import type { AuthResponse, ChangePasswordInput, LoginInput, RegisterInput, UpdateMeInput, UploadFile, User } from '../types';
import { delay } from './delay';

// Usuário de teste: teste@kolae.com / 12345678
const users: (User & { password: string })[] = [
  {
    id: 1,
    name: 'Jogador Teste',
    email: 'teste@kolae.com',
    password: '12345678',
    birthdate: '2004-05-17',
    role: 'player',
    avatar_url: null,
    created_at: '2026-10-26T20:00:00-03:00',
  },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_DAYS = 30; // D07

const strip = ({ password: _password, ...user }: User & { password: string }): User => user;
const tokenFor = (id: number) => `mock-token-${id}`;

function authResponse(user: User & { password: string }): AuthResponse {
  const expires = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  return { token: tokenFor(user.id), token_type: 'Bearer', expires_at: expires.toISOString(), user: strip(user) };
}

// Mesmos erros da API (docs/api.md): status, code e errors como lista por campo.
function validationError(errors: Record<string, string[]>) {
  if (Object.keys(errors).length) {
    throw new ApiRequestError(422, 'VALIDATION_ERROR', 'Verifique os campos informados.', errors);
  }
}

function userFromToken(token: string) {
  if (!token) throw new ApiRequestError(401, 'AUTH_MISSING_TOKEN', 'Token de acesso não informado.');
  const user = users.find((u) => tokenFor(u.id) === token);
  if (!user) throw new ApiRequestError(401, 'AUTH_INVALID_TOKEN', 'Token inválido.');
  return user;
}

function passwordErrors(password: string, confirmation: string, errors: Record<string, string[]>) {
  if (!password) errors.password = ['A senha é obrigatória.'];
  else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = [`A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`];
  }
  if (password !== confirmation) errors.password_confirmation = ['A confirmação não confere com a senha.'];
}

export async function mockLogin(input: LoginInput): Promise<AuthResponse> {
  await delay();
  const errors: Record<string, string[]> = {};
  if (!EMAIL.test(input.email.trim())) errors.email = ['Informe um e-mail válido.'];
  if (!input.password) errors.password = ['A senha é obrigatória.'];
  validationError(errors);

  const user = users.find((u) => u.email === input.email.trim().toLowerCase());
  if (!user || user.password !== input.password) {
    throw new ApiRequestError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha incorretos.');
  }
  return authResponse(user);
}

export async function mockRegister(input: RegisterInput): Promise<AuthResponse> {
  await delay();
  const errors: Record<string, string[]> = {};
  if (!input.name.trim()) errors.name = ['O nome é obrigatório.'];
  if (!EMAIL.test(input.email.trim())) errors.email = ['Informe um e-mail válido.'];
  else if (users.some((u) => u.email === input.email.trim().toLowerCase())) {
    errors.email = ['Este e-mail já está cadastrado.'];
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.birthdate)) errors.birthdate = ['Informe a data no formato AAAA-MM-DD.'];
  else if (!isOldEnough(input.birthdate)) errors.birthdate = ['É preciso ter 18 anos ou mais.'];
  passwordErrors(input.password, input.password_confirmation, errors);
  validationError(errors);

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
  return authResponse(user);
}

export async function mockMe(token: string): Promise<User> {
  await delay(300);
  return strip(userFromToken(token));
}

export async function mockForgotPassword(email: string): Promise<void> {
  // A API responde igual exista ou não o e-mail, para não revelar quem tem conta.
  await delay();
  if (!EMAIL.test(email.trim())) validationError({ email: ['Informe um e-mail válido.'] });
}

export async function mockChangePassword(token: string, input: ChangePasswordInput): Promise<void> {
  await delay();
  const user = userFromToken(token);
  const errors: Record<string, string[]> = {};
  if (user.password !== input.current_password) errors.current_password = ['A senha atual está incorreta.'];
  passwordErrors(input.password, input.password_confirmation, errors);
  validationError(errors);
  user.password = input.password;
}

const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

export async function mockUploadAvatar(token: string, file: UploadFile): Promise<User> {
  await delay(900);
  const user = userFromToken(token);
  if (!AVATAR_TYPES.includes(file.type)) validationError({ avatar: ['Envie uma imagem JPG, PNG ou GIF.'] });
  user.avatar_url = file.uri; // no mock, a própria foto do celular
  return strip(user);
}

export async function mockUpdateMe(token: string, input: UpdateMeInput): Promise<User> {
  await delay();
  const user = userFromToken(token);
  const name = input.name.trim();
  if (!name) validationError({ name: ['O nome é obrigatório.'] });
  else if (name.length > 255) validationError({ name: ['Use até 255 caracteres.'] });
  user.name = name;
  return strip(user);
}
