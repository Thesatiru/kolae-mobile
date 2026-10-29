import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueSummary } from '@/api/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { formatDecimal, formatPricePerHour, formatTime } from '@/utils/format';

// Quadra escolhida no mapa. Tocar abre as informações dela.
export function MapVenueCard({ venue }: { venue: VenueSummary }) {
  const c = useColors();
  const { t } = useTranslation();
  const { motionReduced } = usePreferences();

  const details = [
    venue.sports[0]?.name,
    t(`app_floor_${venue.floor_type}`).toLowerCase(),
    venue.distance_km !== null ? `${formatDecimal(venue.distance_km)} km` : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const price = formatPricePerHour(venue.price_per_hour_cents);
  const status = [
    t(`app_status_${venue.status}`),
    venue.status_until ? t(`app_status_${venue.status}_until`, { time: formatTime(venue.status_until) }) : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[venue.name, status, details, price].join(', ')}
      accessibilityHint={t('app_a11y_open_venue')}
      onPress={() => router.push({ pathname: '/venue/[id]', params: { id: String(venue.id) } })}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: c.background, opacity: pressed ? 0.9 : 1 },
        contrastOutline(c),
      ]}>
      <View style={[styles.photo, { backgroundColor: c.surface }]}>
        {venue.cover_image_url ? (
          <Image
            source={venue.cover_image_url}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={motionReduced ? 0 : 150}
          />
        ) : (
          <MaterialCommunityIcons name="soccer-field" size={36} color={c.textMuted} />
        )}
      </View>
      <View style={styles.info}>
        <StatusBadge status={venue.status} until={venue.status_until} />
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {venue.name}
        </Text>
        {details ? (
          <Text style={[styles.details, { color: c.textMuted }]} numberOfLines={1}>
            {details}
          </Text>
        ) : null}
        <Text style={[styles.price, { color: c.text }]}>{price}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 10,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  photo: { width: 96, height: 112, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, justifyContent: 'center', gap: 4 },
  name: { fontSize: 18, fontFamily: fonts.medium },
  details: { fontSize: 13 },
  price: { fontSize: 16, fontWeight: '700' },
});
