import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/Text';
import type { Author } from '@/showcase/community';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { initials } from '@/utils/format';

/** Círculo com as iniciais (a Comunidade é vitrine: não há fotos de perfil). Decorativo. */
export function Avatar({ author, size = 44 }: { author: Pick<Author, 'name' | 'tone'>; size?: number }) {
  const c = useColors();
  const strong = author.tone === 'strong';
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: strong ? c.selected : c.primary },
      ]}>
      <Text style={{ color: strong ? c.onSelected : c.onPrimary, fontSize: size * 0.36, fontWeight: '700' }}>
        {initials(author.name)}
      </Text>
    </View>
  );
}

/** Faixa "Prévia": a Comunidade é só visual, para ninguém achar que publicou de verdade. */
export function PreviewBanner() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View style={[styles.banner, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <Text style={[styles.bannerText, { color: c.link }]}>{t('app_community_preview')}</Text>
    </View>
  );
}

/** Selo de quem é responsável por uma quadra. */
export function OwnerBadge() {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View style={[styles.badge, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{t('app_owner')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  banner: { paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center' },
  bannerText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
  badge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontSize: 13, fontWeight: '700' },
});
