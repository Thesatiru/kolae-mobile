import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueSummary } from '@/api/types';
import { StatusBadge, statusText } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { VenueCover } from '@/components/VenueCover';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { useColors } from '@/theme/useColors';
import { formatDecimal, formatPrice, formatPricePerHour, noPriceLabel } from '@/utils/format';

// Card da quadra (Pesquisar e Favoritos): foto, nome, o status (o que o app promete mostrar)
// e a linha "1,2 km · R$ 120/h". A distância só vem quando a busca manda a posição.
export function VenueCard({ venue, width = 176 }: { venue: VenueSummary; width?: number }) {
  const c = useColors();
  const { t } = useTranslation();
  const { isFavorite, toggle } = useFavorites();
  const favorite = isFavorite(venue.id);
  const distance = venue.distance_km !== null ? `${formatDecimal(venue.distance_km)} km` : null;

  // Leitor de tela: o card é lido como uma frase só ("Sesc, Disponível · até 19:00, 1,2 km,
  // grátis") e favoritar vira uma ação do card (o coração dentro dele não recebe foco separado).
  const price = formatPrice(venue.price_per_hour_cents);
  const a11yLabel = [
    venue.name,
    statusText(t, venue.status, venue.status_until),
    distance,
    price ? t('app_a11y_price_per_hour', { price }) : noPriceLabel(venue.price_per_hour_cents),
    favorite ? t('app_a11y_in_favorites') : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityActions={[{ name: 'favorite', label: favorite ? t('app_unfavorite') : t('app_favorite') }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'favorite' && toggle(venue.id)}
      style={({ pressed }) => [{ width, opacity: pressed ? 0.85 : 1 }]}
      onPress={() => router.push({ pathname: '/venue/[id]', params: { id: String(venue.id) } })}>
      <View style={[styles.imageBox, { width, height: Math.round(width * 0.82) }]}>
        <VenueCover uri={venue.cover_image_url} style={StyleSheet.absoluteFill} logoHeight={width * 0.4} />
        <Pressable
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          hitSlop={12}
          onPress={() => toggle(venue.id)}
          style={styles.heart}>
          <MaterialCommunityIcons name={favorite ? 'heart' : 'heart-outline'} size={24} color="#FFFFFF" style={styles.heartIcon} />
        </Pressable>
      </View>

      <Text style={[styles.name, { color: c.text }]} numberOfLines={2}>
        {venue.name}
      </Text>
      <View style={styles.badge}>
        <StatusBadge status={venue.status} until={venue.status_until} />
      </View>
      <Text style={[styles.small, { color: c.textMuted }]} numberOfLines={1}>
        {[distance, formatPricePerHour(venue.price_per_hour_cents)].filter(Boolean).join(' · ')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  heart: { position: 'absolute', top: 10, right: 10 },
  // sombra leve para o coração branco aparecer em fotos claras
  heartIcon: { textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 4 },
  name: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  badge: { marginBottom: 6 },
  small: { fontSize: 13 },
});
