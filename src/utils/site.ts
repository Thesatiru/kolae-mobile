import { API_URL } from '@/api/client';

// Endereço do site, tirado da API: https://kolae.online/api/v1 -> https://kolae.online
// (no backend local, o site local). Sem API configurada, a produção.
export const SITE_URL = API_URL.replace(/\/api\/v\d+\/?$/, '') || 'https://kolae.online';

/** Página pública da quadra no site (D49), aberta sem login e com prévia no WhatsApp. */
export function venuePageUrl(venueId: number) {
  return `${SITE_URL}/quadra/${venueId}`;
}
