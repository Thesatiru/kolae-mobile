import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';

// Carregando / erro com "tentar de novo" / vazio, num só lugar.
type Props = {
  loading: boolean;
  error: unknown;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
  minHeight?: number;
  children: React.ReactNode;
};

export function QueryState({ loading, error, empty, emptyText, onRetry, minHeight = 120, children }: Props) {
  const c = useColors();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <ActivityIndicator color={c.primary} accessibilityLabel={t('app_loading')} />
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text accessibilityLiveRegion="polite" style={{ color: c.textMuted }}>
          {t('app_load_error')}
        </Text>
        <Pressable accessibilityRole="button" onPress={onRetry} hitSlop={14}>
          <Text style={{ color: c.primary, fontWeight: '700' }}>{t('app_retry')}</Text>
        </Pressable>
      </View>
    );
  }
  if (empty) {
    return (
      <View style={[styles.center, { minHeight }]}>
        <Text style={[styles.empty, { color: c.textMuted }]}>{emptyText}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  empty: { textAlign: 'center' },
});
