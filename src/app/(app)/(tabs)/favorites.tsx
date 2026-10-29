import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listVenues } from '@/api/venues';
import { QueryState } from '@/components/QueryState';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { VenueCard } from '@/components/VenueCard';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

export default function FavoritesScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { ids } = useFavorites();
  const query = useQuery({ queryKey: ['venues', { per_page: 100 }], queryFn: () => listVenues({ per_page: 100 }) });
  const favorites = (query.data?.data ?? []).filter((v) => ids.has(v.id));

  return (
    <Screen contentStyle={styles.content}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>{t('app_tab_favorites')}</Text>
      <QueryState
        loading={query.isPending}
        error={query.error}
        empty={favorites.length === 0}
        emptyText={t('app_favorites_empty')}
        onRetry={query.refetch}
        minHeight={300}>
        <View style={styles.grid}>
          {favorites.map((v) => (
            <VenueCard key={v.id} venue={v} width={155} />
          ))}
        </View>
      </QueryState>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  title: { fontSize: 28, fontFamily: fonts.medium },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
