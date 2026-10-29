import { useQuery } from '@tanstack/react-query';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listVenues } from '@/api/venues';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { Screen } from '@/components/Screen';
import { VenueCard } from '@/components/VenueCard';
import { useFavorites } from '@/favorites/FavoritesProvider';

export default function FavoritesScreen() {
  const { t } = useTranslation();
  const { ids } = useFavorites();
  const query = useQuery({ queryKey: ['venues', { per_page: 100 }], queryFn: () => listVenues({ per_page: 100 }) });
  const favorites = (query.data?.data ?? []).filter((v) => ids.has(v.id));

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_tab_favorites')} />
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
});
