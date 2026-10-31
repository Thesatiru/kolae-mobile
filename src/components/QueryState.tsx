import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorState } from '@/components/ErrorState';
import { LogoMark } from '@/components/Logo';
import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';

// Carregando / erro / vazio, num só lugar.
type Props = {
  loading: boolean;
  error: unknown;
  empty: boolean;
  emptyText: string;
  onRetry: () => void;
  minHeight?: number;
  /** "screen" quando a tela inteira depende destes dados (ex.: informações da quadra). */
  errorVariant?: 'screen' | 'inline';
  children: React.ReactNode;
};

export function QueryState({ loading, error, empty, emptyText, onRetry, minHeight = 120, errorVariant, children }: Props) {
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
    return <ErrorState error={error} onRetry={onRetry} variant={errorVariant} minHeight={minHeight} />;
  }
  if (empty) {
    return (
      <View style={[styles.center, { minHeight }]}>
        {/* O mesmo K cinza das quadras sem foto e do perfil vazio. */}
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LogoMark color={c.scheme === 'dark' ? c.textMuted : c.border} colors={c.rainbow} height={44} />
        </View>
        <Text style={[styles.empty, { color: c.textMuted }]}>{emptyText}</Text>
      </View>
    );
  }
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  empty: { textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
