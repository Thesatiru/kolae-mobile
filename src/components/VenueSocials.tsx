import { FontAwesome6 } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueSocials as Socials } from '@/api/types';
import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';

type Link = { key: string; icon: string; brand: boolean; name: string; url: string };

/** Monta os links na ordem da proposta D60; o que vem null fica de fora. */
function socialLinks(socials: Socials, website: string): Link[] {
  const links: (Link | null)[] = [
    socials.instagram
      ? { key: 'instagram', icon: 'instagram', brand: true, name: 'Instagram', url: `https://instagram.com/${encodeURIComponent(socials.instagram)}` }
      : null,
    socials.tiktok
      ? { key: 'tiktok', icon: 'tiktok', brand: true, name: 'TikTok', url: `https://www.tiktok.com/@${encodeURIComponent(socials.tiktok)}` }
      : null,
    socials.facebook_url ? { key: 'facebook', icon: 'facebook', brand: true, name: 'Facebook', url: socials.facebook_url } : null,
    socials.website_url ? { key: 'website', icon: 'globe', brand: false, name: website, url: socials.website_url } : null,
  ];
  return links.filter((l): l is Link => l !== null);
}

/**
 * Ícones redondos com as redes da quadra (Instagram, TikTok, Facebook e site).
 * Sem nenhuma rede (as quatro null, D60), não mostra nada.
 */
export function VenueSocials({ socials }: { socials: Socials }) {
  const c = useColors();
  const { t } = useTranslation();
  const links = socialLinks(socials, t('app_social_website'));
  if (!links.length) return null;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.caption, { color: c.textMuted }]}>{t('app_socials')}</Text>
      <View style={styles.row}>
        {links.map((link) => (
          <Pressable
            key={link.key}
            accessibilityRole="link"
            accessibilityLabel={t('app_social_a11y', { network: link.name })}
            accessibilityHint={t('app_social_hint')}
            onPress={() => Linking.openURL(link.url)}
            style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}>
            <View style={[styles.circle, { borderColor: c.divider, backgroundColor: c.background }]}>
              <FontAwesome6 name={link.icon} size={20} color={c.text} brand={link.brand} solid={!link.brand} />
            </View>
            <Text style={[styles.label, { color: c.textMuted }]} numberOfLines={1}>
              {link.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 18 },
  caption: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 18 },
  item: { alignItems: 'center', gap: 6, minWidth: 56 },
  circle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 12 },
});
