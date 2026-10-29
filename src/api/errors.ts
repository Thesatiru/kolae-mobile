import { isAxiosError } from 'axios';

import type { ApiErrorBody } from './types';

// Códigos só do app, para erros que não vêm da API (sem resposta ou resposta sem JSON).
export const NETWORK_ERROR = 'NETWORK_ERROR';
export const UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE';

/** Erro único para o app inteiro, venha da API real ou do mock. */
export class ApiRequestError extends Error {
  status: number;
  code: string; // estável (ex.: "VALIDATION_ERROR"); decidir o fluxo por ele, nunca pelo texto
  fieldErrors: Record<string, string[]>;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
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
      return new ApiRequestError(0, NETWORK_ERROR, 'Sem conexão com o servidor. Verifique sua internet.');
    }
    const body = err.response.data;
    // Se o servidor devolver HTML (ex.: proteção anti-bot da hospedagem), não há "message".
    if (!body || typeof body !== 'object' || !('message' in body)) {
      return new ApiRequestError(err.response.status, UNEXPECTED_RESPONSE, 'Resposta inesperada do servidor.');
    }
    return new ApiRequestError(err.response.status, body.code ?? UNEXPECTED_RESPONSE, body.message, body.errors ?? {});
  }

  return new ApiRequestError(0, UNEXPECTED_RESPONSE, 'Erro inesperado. Tente novamente.');
}
