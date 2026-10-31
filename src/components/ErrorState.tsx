import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { NETWORK_ERROR, toApiError } from '@/api/errors';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';
import { Text } from '@/components/Text';
import { linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { openSupport } from '@/utils/support';

type Kind = 'offline' | 'notFound' | 'generic';

/** Que tipo de erro mostrar: sem internet, não encontrado (404) ou o resto. */
export function errorKind(error: unknown): Kind {
  const { code, status } = toApiError(error);
  if (code === NETWORK_ERROR) return 'offline';
  if (status === 404) return 'notFound';
  return 'generic';
}

const TEXTS = {
  offline: { title: 'app_offline_title', text: 'app_offline_text' },
  notFound: { title: 'app_not_found_title', text: 'app_not_found_text' },
  generic: { title: 'app_error_title', text: 'app_error_text' },
} as const;

type Props = {
  error: unknown;
  onRetry?: () => void;
  /** "screen" ocupa a tela toda (a tela não tem o que mostrar sem os dados); "inline" cabe numa seção. */
  variant?: 'screen' | 'inline';
  minHeight?: number;
};

/**
 * Erro com o K do Kolae no meio: "Algo deu errado... Se o erro persistir, entre em contato com o
 * suporte", com Tentar de novo e Falar com o suporte. Sem internet não oferece o suporte (não
 * funcionaria); não encontrado oferece Voltar.
 */
export function ErrorState({ error, onRetry, variant = 'inline', minHeight }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const kind = errorKind(error);
  const screen = variant === 'screen';
  const { title, text } = TEXTS[kind];

  return (
    <View style={[styles.box, screen ? styles.screen : styles.inline, minHeight ? { minHeight } : null]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LogoMark color={c.primary} colors={c.rainbow} height={screen ? 96 : 52} />
      </View>
      <View accessibilityLiveRegion="polite" style={styles.texts}>
        <Text
          accessibilityRole={screen ? 'header' : undefined}
          style={[screen ? styles.titleScreen : styles.title, { color: c.text }]}>
          {t(title)}
        </Text>
        <Text style={[styles.text, { color: c.textMuted }]}>{t(text)}</Text>
      </View>

      <View style={styles.actions}>
        {kind === 'notFound' ? (
          router.canGoBack() ? <Button compact title={t('app_back')} onPress={() => router.back()} /> : null
        ) : onRetry ? (
          <Button compact icon="refresh" title={t('app_retry')} onPress={onRetry} />
        ) : null}
        {kind === 'generic' ? (
          <Text
            accessibilityRole="button"
            onPress={openSupport}
            suppressHighlighting
            style={[styles.support, { color: c.link }, linkDecoration(c)]}>
            {t('app_error_support')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  screen: { flex: 1, gap: 20, paddingVertical: 40 },
  inline: { gap: 12, paddingVertical: 16 },
  texts: { alignItems: 'center', gap: 6 },
  title: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  titleScreen: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  text: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  actions: { alignItems: 'center', gap: 10 },
  support: { fontSize: 15, fontWeight: '700', padding: 10 },
});
