import * as WebBrowser from 'expo-web-browser';

import { API_URL } from '@/api/client';
import type { ThemeColors } from '@/theme/colors';

// Termos e política ficam no site (uma versão só do texto, D42: em português). O endereço sai
// da API: https://kolae.online/api/v1 -> https://kolae.online/termos (no backend local, a página local).
const SITE_URL = API_URL.replace(/\/api\/v\d+\/?$/, '') || 'https://kolae.online';

export const TERMS_URL = `${SITE_URL}/termos`;
export const PRIVACY_URL = `${SITE_URL}/privacidade`;

/** Abre a página num navegador dentro do app, com a barra nas cores do tema. */
export function openLegal(url: string, c: ThemeColors) {
  return WebBrowser.openBrowserAsync(url, {
    toolbarColor: c.background,
    controlsColor: c.primary,
    enableBarCollapsing: true,
    showTitle: true,
  });
}
