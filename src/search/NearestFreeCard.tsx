import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueSummary } from '@/api/types';
import { getVenue } from '@/api/venues';
import { Button } from '@/components/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { VenueCover } from '@/components/VenueCover';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { formatDecimal, formatPricePerHour } from '@/utils/format';
import { LiveDot } from './LiveDot';

// Destaque do topo da Pesquisar: a quadra livre mais perto (ou, sem a posição, uma livre),
// com "Falar com o dono" direto. É a proposta do app num toque: "quero jogar agora, onde?".
// A lista não traz o WhatsApp do dono: busca o detalhe só desta quadra, e a mesma consulta
// (['venue', id]) já fica pronta para quando a pessoa abrir a quadra.
export function NearestFreeCard({ venue, nearest }: { venue: VenueSummary; nearest: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const detail = useQuery({ queryKey: ['venue', venue.id], queryFn: () => getVenue(venue.id) });
  const whatsapp = detail.data?.owner.whatsapp ?? null;
  const distance = venue.distance_km !== null ? `${formatDecimal(venue.distance_km)} km` : null;
  const meta = [distance, formatPricePerHour(venue.price_per_hour_cents)].filter(Boolean).join(' · ');
  const open = () => router.push({ pathname: '/venue/[id]', params: { id: String(venue.id) } });

  return (
    <View style={[styles.card, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={[t(nearest ? 'app_hero_nearest' : 'app_hero_free'), venue.name, meta].join(', ')}
        onPress={open}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}>
        <View style={styles.cover}>
          <VenueCover uri={venue.cover_image_url} style={StyleSheet.absoluteFill} logoHeight={64} />
        </View>
        <View style={styles.body}>
          <View style={styles.kicker}>
            <LiveDot />
            <Text style={[styles.kickerText, { color: c.textMuted }]}>{t(nearest ? 'app_hero_nearest' : 'app_hero_free')}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.name, { color: c.text }]}>
            {venue.name}
          </Text>
          <View style={styles.statusRow}>
            <StatusBadge status={venue.status} until={venue.status_until} />
            <Text numberOfLines={1} style={[styles.meta, { color: c.textMuted }]}>
              {meta}
            </Text>
          </View>
        </View>
      </Pressable>
      {/* Sem WhatsApp cadastrado, o botão não aparece (D24): fica só o "Ver quadra". */}
      <View style={styles.actions}>
        {whatsapp ? (
          <View style={styles.flex}>
            <Button
              icon="whatsapp"
              compact
              title={t('app_talk_to_owner')}
              accessibilityHint={t('app_chat_whatsapp')}
              onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
            />
          </View>
        ) : null}
        <View style={whatsapp ? undefined : styles.flex}>
          <Button variant="outline" compact title={t('app_see_venue')} onPress={open} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderRadius: 22, overflow: 'hidden' },
  cover: { height: 150 },
  body: { paddingHorizontal: 16, paddingTop: 14, gap: 6 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerText: { fontSize: 13, fontWeight: '700' },
  name: { fontSize: 21, lineHeight: 27, fontFamily: fonts.medium },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 10, rowGap: 4 },
  meta: { flexShrink: 1, fontSize: 14 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  flex: { flex: 1 },
});
