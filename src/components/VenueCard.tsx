import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueSummary } from '@/api/types';
import { Text } from '@/components/Text';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';
import { formatPrice, formatPricePerHour, noPriceLabel } from '@/utils/format';

export function VenueCard({ venue, width = 164 }: { venue: VenueSummary; width?: number }) {
  const c = useColors();
  const { t } = useTranslation();
  const { isFavorite, toggle } = useFavorites();
  const { motionReduced } = usePreferences();
  const favorite = isFavorite(venue.id);

  // Leitor de tela: o card é lido como uma frase só ("Sesc, grátis") e favoritar vira
  // uma ação do card (o coração dentro dele não recebe foco separado).
  const price = formatPrice(venue.price_per_hour_cents);
  const a11yLabel = [
    venue.name,
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
      <View style={[styles.imageBox, { width, height: width, backgroundColor: c.surface }]}>
        <Image source={venue.cover_image_url} style={StyleSheet.absoluteFill} contentFit="cover" transition={motionReduced ? 0 : 150} />
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
      <Text style={[styles.small, { color: c.textMuted }]}>{formatPricePerHour(venue.price_per_hour_cents)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  imageBox: { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  heart: { position: 'absolute', top: 10, right: 10 },
  // sombra leve para o coração branco aparecer em fotos claras
  heartIcon: { textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 4 },
  name: { fontSize: 16, marginBottom: 2 },
  small: { fontSize: 12 },
});
