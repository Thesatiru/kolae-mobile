import { router } from 'expo-router';

// Para onde vai o "Falar com o suporte" das telas de erro. Hoje é a Central de ajuda do app;
// quando o site tiver uma página de suporte (ainda não existe no repositório do João), trocar
// aqui por openBrowserAsync(`${SITE}/suporte`), como em utils/legal.ts.
export function openSupport() {
  router.push('/settings/help');
}
