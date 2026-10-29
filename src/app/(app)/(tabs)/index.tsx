import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listSports, listVenues } from '@/api/venues';
import type { Sport, VenueFilters } from '@/api/types';
import { QueryState } from '@/components/QueryState';
import { RainbowStripe } from '@/components/Rainbow';
import { Screen } from '@/components/Screen';
import { Text, useInputFont } from '@/components/Text';
import { VenueCard } from '@/components/VenueCard';
import { useUserPosition } from '@/location/useUserPosition';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { sportIcon } from '@/utils/sportIcons';

// Espera o usuário parar de digitar antes de buscar.
function useDebounced<T>(value: T, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

function VenueSection({ title, filters, enabled = true }: { title: string; filters: VenueFilters; enabled?: boolean }) {
  const c = useColors();
  const { t } = useTranslation();
  const query = useQuery({ queryKey: ['venues', filters], queryFn: () => listVenues(filters), enabled });
  const venues = query.data?.data ?? [];

  return (
    <View>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
        {title}
      </Text>
      <QueryState
        loading={query.isPending}
        error={query.error}
        empty={venues.length === 0}
        emptyText={t('app_no_results')}
        onRetry={query.refetch}
        minHeight={220}>
        <FlatList
          data={venues}
          keyExtractor={(v) => String(v.id)}
          renderItem={({ item }) => <VenueCard venue={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cards}
        />
      </QueryState>
    </View>
  );
}

function SportChip({ sport, selected, onPress }: { sport: Sport; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={styles.chip}>
      <View style={[styles.chipCircle, { backgroundColor: selected ? c.selected : c.surface }, contrastOutline(c)]}>
        <MaterialCommunityIcons name={sportIcon(sport.icon_path)} size={24} color={selected ? c.onSelected : c.text} />
      </View>
      <Text style={[styles.chipText, { color: c.text, fontWeight: selected ? '700' : '400' }]}>{sport.name}</Text>
      {selected && c.rainbow ? (
        <RainbowStripe colors={c.rainbow} height={3} style={styles.chipLine} />
      ) : (
        <View style={[styles.chipLine, { backgroundColor: selected ? c.selected : 'transparent' }]} />
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);
  const [search, setSearch] = useState('');
  const [sportId, setSportId] = useState<number | undefined>(undefined);
  const q = useDebounced(search.trim()) || undefined;

  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports });
  // "Perto de você" precisa da posição (sort=distance sem lat/lng é 422); sem ela, lista todas.
  const { position, ready } = useUserPosition();
  const near: VenueFilters = position
    ? { q, sport_id: sportId, lat: position.latitude, lng: position.longitude, sort: 'distance' }
    : { q, sport_id: sportId };

  return (
    <Screen contentStyle={styles.content}>
      <View style={[styles.search, { backgroundColor: c.surface }, contrastOutline(c)]}>
        <TextInput
          accessibilityLabel={t('app_search_ph')}
          placeholder={t('app_search_ph')}
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          style={[styles.searchInput, { color: c.text }, inputFont]}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')} hitSlop={13} accessibilityRole="button" accessibilityLabel={t('app_clear_search')}>
            <MaterialCommunityIcons name="close" size={22} color={c.textMuted} />
          </Pressable>
        ) : (
          <MaterialCommunityIcons name="magnify" size={24} color={c.text} accessibilityElementsHidden importantForAccessibility="no" />
        )}
      </View>

      <FlatList
        data={sports.data ?? []}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => (
          <SportChip
            sport={item}
            selected={item.id === sportId}
            // tocar no esporte já selecionado limpa o filtro
            onPress={() => setSportId((cur) => (cur === item.id ? undefined : item.id))}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      />

      <VenueSection title={t(position ? 'app_section_near' : 'app_section_all')} filters={near} enabled={ready} />
      {/* D33: "Mais avaliadas" virou "Disponíveis agora" (avaliação é vitrine). */}
      <VenueSection title={t('app_section_available')} filters={{ q, sport_id: sportId, status: 'available' }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0, paddingTop: 24, paddingBottom: 32, gap: 28 },
  search: {
    marginHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 28,
    paddingHorizontal: 22,
    minHeight: 56,
  },
  searchInput: { flex: 1 },
  chips: { paddingHorizontal: 20, gap: 28 },
  chip: { alignItems: 'center' },
  chipCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  chipText: { fontSize: 14 },
  chipLine: { height: 2, alignSelf: 'stretch', marginTop: 4 },
  sectionTitle: { fontSize: 28, fontFamily: fonts.regular, paddingHorizontal: 20, marginBottom: 16 },
  cards: { paddingHorizontal: 20, gap: 16 },
});
