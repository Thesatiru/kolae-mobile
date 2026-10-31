import { NETWORK_ERROR, toApiError, UNEXPECTED_RESPONSE } from '@/api/errors';
import i18n from '@/i18n';

/**
 * Mensagem de erro para mostrar num formulário ou alerta. Sem internet e erro do servidor viram
 * os textos do app (traduzidos, com o caminho do suporte); o resto é a mensagem da API
 * (ex.: "E-mail ou senha incorretos.").
 */
export function errorMessage(err: unknown): string {
  const error = toApiError(err);
  if (error.code === NETWORK_ERROR) return `${i18n.t('app_offline_title')}. ${i18n.t('app_offline_text')}`;
  if (error.code === UNEXPECTED_RESPONSE || error.status >= 500) {
    return `${i18n.t('app_error_title')} ${i18n.t('app_error_text')}`;
  }
  return error.message;
}
