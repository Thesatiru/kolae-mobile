import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import appEn from './locales/app/en-us.json';
import appEs from './locales/app/es-es.json';
import appHi from './locales/app/hi-in.json';
import appIt from './locales/app/it-it.json';
import appJa from './locales/app/ja-jp.json';
import appPt from './locales/app/pt-br.json';
import appZh from './locales/app/zh-cn.json';
import siteEn from './locales/site/en-us.json';
import siteEs from './locales/site/es-es.json';
import siteHi from './locales/site/hi-in.json';
import siteIt from './locales/site/it-it.json';
import siteJa from './locales/site/ja-jp.json';
import sitePt from './locales/site/pt-br.json';
import siteZh from './locales/site/zh-cn.json';

// Chaves do site (lang/*.php convertidos) + chaves próprias do app (prefixo app_).
const resources = {
  'pt-br': { translation: { ...sitePt, ...appPt } },
  'en-us': { translation: { ...siteEn, ...appEn } },
  'es-es': { translation: { ...siteEs, ...appEs } },
  'it-it': { translation: { ...siteIt, ...appIt } },
  'ja-jp': { translation: { ...siteJa, ...appJa } },
  'zh-cn': { translation: { ...siteZh, ...appZh } },
  'hi-in': { translation: { ...siteHi, ...appHi } },
};

export type Language = keyof typeof resources;

// Nome de cada idioma escrito nele mesmo, para a lista de Configurações › Idioma.
export const languages: { code: Language; name: string }[] = [
  { code: 'pt-br', name: 'Português (Brasil)' },
  { code: 'en-us', name: 'English (US)' },
  { code: 'es-es', name: 'Español' },
  { code: 'it-it', name: 'Italiano' },
  { code: 'ja-jp', name: '日本語' },
  { code: 'zh-cn', name: '中文（简体）' },
  { code: 'hi-in', name: 'हिन्दी' },
];

// "pt-BR" do aparelho vira "pt-br"; se não houver o idioma, cai no português.
export function deviceLanguage(): Language {
  const tag = getLocales()[0]?.languageTag?.toLowerCase() ?? 'pt-br';
  if (tag in resources) return tag as Language;
  const byPrefix = (Object.keys(resources) as Language[]).find((k) => k.startsWith(tag.slice(0, 2)));
  return byPrefix ?? 'pt-br';
}

i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage(),
  fallbackLng: 'pt-br',
  keySeparator: false, // as chaves do site usam _ e não têm níveis
  // Sem isto o i18next troca "pt-br" por "pt-BR", não acha os textos e mostra as chaves.
  lowerCaseLng: true,
  interpolation: { escapeValue: false },
});

export default i18n;
