import * as WebBrowser from 'expo-web-browser';

import type { ThemeColors } from '@/theme/colors';
import { SITE_URL } from '@/utils/site';

// Termos e política ficam no site (uma versão só do texto, D42: em português).

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
