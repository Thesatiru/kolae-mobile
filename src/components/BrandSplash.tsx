import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { fonts } from '@/theme/fonts';
import { Logo } from './Logo';

// Continuação da splash nativa (mesmo azul), enquanto fontes e sessão carregam.
export function BrandSplash() {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Logo size={80} />
      <Text style={styles.subtitle}>{t('app_splash_welcome')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0084FF', alignItems: 'center', justifyContent: 'center' },
  subtitle: { color: '#FFFFFF', fontSize: 24, fontFamily: fonts.medium, marginTop: 12 },
});
