import { Alert } from 'react-native';

import i18n from '@/i18n';

// Itens do design que ainda não têm tela ou API: avisa em vez de não fazer nada.
export const showSoon = () => Alert.alert(i18n.t('app_soon'));
