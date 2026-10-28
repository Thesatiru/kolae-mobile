import { isAxiosError } from 'axios';

import type { ApiErrorBody } from './types';

/** Erro único para o app inteiro, venha da API real ou do mock. */
export class ApiRequestError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(status: number, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  /** Primeira mensagem de um campo, para mostrar embaixo do input. */
  field(name: string): string | undefined {
    return this.fieldErrors[name]?.[0];
  }
}

export function toApiError(err: unknown): ApiRequestError {
  if (err instanceof ApiRequestError) return err;

  if (isAxiosError<ApiErrorBody>(err)) {
    if (!err.response) {
      return new ApiRequestError(0, 'Sem conexão com o servidor. Verifique sua internet.');
    }
    const body = err.response.data;
    // Se o servidor devolver HTML (ex.: proteção anti-bot da hospedagem), não há "message".
    const message =
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Resposta inesperada do servidor.';
    return new ApiRequestError(err.response.status, message, body?.errors ?? {});
  }

  return new ApiRequestError(0, 'Erro inesperado. Tente novamente.');
}
