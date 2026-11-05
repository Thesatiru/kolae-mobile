import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listSports, listVenues } from '@/api/venues';
import type { Sport, VenueFilters, VenueSort, VenueSummary } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { Appear } from '@/components/Appear';
import { Button } from '@/components/Button';
import { usePullToRefresh } from '@/components/PullToRefresh';
import { QueryState } from '@/components/QueryState';
import { RainbowStripe } from '@/components/Rainbow';
import { Screen } from '@/components/Screen';
import { Skeleton, VenueGridSkeleton, VenueRowSkeleton } from '@/components/Skeleton';
import { Text, useInputFont } from '@/components/Text';
import { fieldBoxStyle } from '@/components/TextField';
import { VenueCard } from '@/components/VenueCard';
import { useUserPosition } from '@/location/useUserPosition';
import { FilterChip } from '@/map/FilterChip';
import { LiveDot } from '@/search/LiveDot';
import { LocationPrompt } from '@/search/LocationPrompt';
import { NearestFreeCard } from '@/search/NearestFreeCard';
import { useRecentSearches, useRecentlyViewed } from '@/search/useRecentSearches';
import { contrastOutline, linkDecoration } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { msUntilNextChange } from '@/utils/date';
import { tick } from '@/utils/haptics';
import { sportIcon } from '@/utils/sportIcons';

const SIDE = 20; // margem lateral da tela
const GAP = 16; // entre os cards
const CASCADE_MAX = 8; // só os primeiros cards entram em cascata (o resto já aparece)
const ALL_VENUES: VenueFilters = { per_page: 100 }; // mesma consulta dos Favoritos (cache em comum)

// Filtros rápidos (chips). Cada um vira um parâmetro de GET /venues.
type QuickFilter = 'available' | 'free' | 'covered' | 'lighting' | 'leisure';
const QUICK_FILTERS: { key: QuickFilter; label: string; dot?: boolean }[] = [
  { key: 'available', label: 'app_filter_available_now', dot: true },
  { key: 'free', label: 'app_free' },
  { key: 'covered', label: 'app_covered' },
  { key: 'lighting', label: 'app_filter_lighting' },
  { key: 'leisure', label: 'app_leisure_area' },
];

const SORT_LABEL: Record<VenueSort, string> = { distance: 'app_sort_distance', price: 'app_sort_price', name: 'app_sort_name' };

function toFilters(active: Set<QuickFilter>): VenueFilters {
  return {
    ...(active.has('available') ? { status: 'available' as const } : null),
    ...(active.has('free') ? { max_price_cents: 0 } : null), // 0 = só as grátis (D31)
    ...(active.has('covered') ? { is_covered: true } : null),
    ...(active.has('lighting') ? { has_lighting: true } : null),
    ...(active.has('leisure') ? { has_leisure_area: true } : null),
  };
}

// Espera o usuário parar de digitar antes de buscar.
function useDebounced<T>(value: T, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

// O card mostra o status: a consulta se repete quando algum vence (D03: muda com o relógio).
function useVenues(filters: VenueFilters, enabled = true) {
  return useQuery({
    queryKey: ['venues', filters],
    queryFn: () => listVenues(filters),
    enabled,
    refetchInterval: (q) => msUntilNextChange(q.state.data?.data),
  });
}

// "Olá, João!" e "● 5 quadras livres agora ›" (tocar liga o filtro "Livre agora").
function Header({ onShowAvailable }: { onShowAvailable: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0] ?? '';
  // per_page 1: só precisa do total (meta.total), não das quadras.
  const free = useQuery({
    queryKey: ['venues', { status: 'available', per_page: 1 }],
    queryFn: () => listVenues({ status: 'available', per_page: 1 }),
    refetchInterval: 60_000,
  });
  const total = free.data?.meta.total;
  const summary = total === undefined ? null : total === 0 ? t('app_free_now_none') : t('app_free_now_count', { count: total });

  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.greeting, { color: c.text }]} numberOfLines={1}>
        {t('app_greeting', { name: firstName })}
      </Text>
      {summary ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={summary}
          accessibilityHint={total ? t('app_free_now_hint') : undefined}
          disabled={!total}
          onPress={onShowAvailable}
          hitSlop={8}
          style={styles.summary}>
          <LiveDot />
          <Text style={[styles.summaryText, { color: c.textMuted }]}>{summary}</Text>
          {total ? <MaterialCommunityIcons name="chevron-right" size={18} color={c.textMuted} /> : null}
        </Pressable>
      ) : (
        <View style={styles.summary} />
      )}
    </View>
  );
}

function SportChip({ sport, selected, onPress }: { sport: Sport; selected: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={styles.chip}>
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

function SectionHead({ title, right }: { title: string; right?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.sectionHead}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
        {title}
      </Text>
      {right}
    </View>
  );
}

// Fileira horizontal de cards, os primeiros entrando em cascata.
function VenueRow({ venues }: { venues: VenueSummary[] }) {
  return (
    <FlatList
      data={venues}
      keyExtractor={(v) => String(v.id)}
      renderItem={({ item, index }) =>
        index < CASCADE_MAX ? (
          <Appear index={index}>
            <VenueCard venue={item} />
          </Appear>
        ) : (
          <VenueCard venue={item} />
        )
      }
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    />
  );
}

// Seção horizontal da tela inicial ("Perto de você", "Disponíveis agora").
// exclude: a quadra que já está no destaque não se repete aqui; sem nenhuma outra, a seção some.
function VenueSection({
  title,
  filters,
  enabled = true,
  exclude,
  onSeeAll,
}: {
  title: string;
  filters: VenueFilters;
  enabled?: boolean;
  exclude?: number;
  onSeeAll?: () => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const query = useVenues(filters, enabled);
  const venues = (query.data?.data ?? []).filter((v) => v.id !== exclude);
  if (exclude !== undefined && query.isSuccess && venues.length === 0) return null;

  return (
    <View>
      <SectionHead
        title={title}
        right={
          onSeeAll && venues.length ? (
            <Text accessibilityRole="button" onPress={onSeeAll} style={[styles.seeAll, { color: c.link }, linkDecoration(c)]}>
              {t('app_see_all')}
            </Text>
          ) : null
        }
      />
      <QueryState
        loading={query.isPending}
        error={query.error}
        empty={venues.length === 0}
        emptyText={t('app_no_results')}
        onRetry={query.refetch}
        minHeight={220}
        skeleton={<VenueRowSkeleton />}>
        <VenueRow venues={venues} />
      </QueryState>
    </View>
  );
}

// "Vistas recentemente": ids guardados no aparelho, dados (e status) sempre da API.
// Seção secundária: sem nada visto, com erro ou sem as quadras na lista, simplesmente some.
function RecentlyViewedSection() {
  const { t } = useTranslation();
  const { items } = useRecentlyViewed();
  const query = useVenues(ALL_VENUES, items.length > 0);
  if (!items.length || query.error) return null;
  const byId = new Map((query.data?.data ?? []).map((v) => [v.id, v]));
  const venues = items.map((id) => byId.get(id)).filter((v): v is VenueSummary => !!v);
  if (query.isSuccess && !venues.length) return null;

  return (
    <View>
      <SectionHead title={t('app_recently_viewed')} />
      {query.isPending ? <VenueRowSkeleton /> : <VenueRow venues={venues} />}
    </View>
  );
}

// Com busca ou filtro: uma grade só, com a contagem, a ordem, "Ver no mapa" e o
// "Limpar filtros" quando não acha nada.
function Results({
  filters,
  enabled,
  hasPosition,
  onClear,
  onSeeOnMap,
}: {
  filters: VenueFilters;
  enabled: boolean;
  hasPosition: boolean;
  onClear: () => void;
  onSeeOnMap: () => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - SIDE * 2 - GAP) / 2);
  const sorts: VenueSort[] = hasPosition ? ['distance', 'price', 'name'] : ['price', 'name'];
  const [chosen, setChosen] = useState<VenueSort | null>(null);
  // "Mais perto" exige a posição (sort=distance sem lat/lng é 422): sem ela, cai para "Nome".
  const sort = chosen && sorts.includes(chosen) ? chosen : hasPosition ? 'distance' : 'name';
  const query = useVenues({ ...filters, sort, per_page: 40 }, enabled);
  const venues = query.data?.data ?? [];
  const total = query.data?.meta.total;

  return (
    <View>
      <SectionHead
        title={t('app_results')}
        right={
          total !== undefined ? (
            <Text accessibilityLiveRegion="polite" style={[styles.count, { color: c.textMuted }]}>
              {t('app_results_count', { count: total })}
            </Text>
          ) : null
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tools}>
        {sorts.map((s) => (
          <FilterChip
            key={s}
            label={t(SORT_LABEL[s])}
            selected={s === sort}
            onPress={() => setChosen(s)}
          />
        ))}
        <View style={[styles.toolsDivider, { backgroundColor: c.divider }]} />
        <Button variant="outline" compact icon="map-outline" title={t('app_see_on_map')} onPress={onSeeOnMap} />
      </ScrollView>
      <QueryState
        loading={query.isPending}
        error={query.error}
        empty={venues.length === 0}
        emptyText={t('app_no_results')}
        onRetry={query.refetch}
        minHeight={260}
        skeleton={<VenueGridSkeleton width={cardWidth} />}
        emptyAction={<Button variant="outline" compact title={t('app_filter_clear')} onPress={onClear} />}>
        <View style={styles.grid}>
          {venues.map((venue, index) =>
            index < CASCADE_MAX ? (
              <Appear key={venue.id} index={index}>
                <VenueCard venue={venue} width={cardWidth} />
              </Appear>
            ) : (
              <VenueCard key={venue.id} venue={venue} width={cardWidth} />
            ),
          )}
        </View>
      </QueryState>
    </View>
  );
}

// Buscas recentes, embaixo do campo enquanto ele está em foco e vazio.
function RecentSearches({
  items,
  onPick,
  onRemove,
  onClear,
}: {
  items: string[];
  onPick: (term: string) => void;
  onRemove: (term: string) => void;
  onClear: () => void;
}) {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <Appear style={[styles.recent, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <View style={styles.recentHead}>
        <Text accessibilityRole="header" style={[styles.recentTitle, { color: c.textMuted }]}>
          {t('app_recent_searches')}
        </Text>
        <Text accessibilityRole="button" onPress={onClear} style={[styles.recentClear, { color: c.link }, linkDecoration(c)]}>
          {t('app_recent_clear')}
        </Text>
      </View>
      {items.map((term) => (
        <View key={term} style={styles.recentRow}>
          <Pressable accessibilityRole="button" onPress={() => onPick(term)} style={styles.recentPick}>
            <MaterialCommunityIcons name="history" size={20} color={c.textMuted} />
            <Text numberOfLines={1} style={[styles.recentText, { color: c.text }]}>
              {term}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app_recent_remove', { term })}
            hitSlop={12}
            onPress={() => onRemove(term)}>
            <MaterialCommunityIcons name="close" size={18} color={c.textMuted} />
          </Pressable>
        </View>
      ))}
    </Appear>
  );
}

export default function HomeScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const inputFont = useInputFont(16);
  const recent = useRecentSearches();
  const [search, setSearch] = useState('');
  const [focused, setFocused] = useState(false);
  const [sportId, setSportId] = useState<number | undefined>(undefined);
  const [quick, setQuick] = useState<Set<QuickFilter>>(new Set());
  const q = useDebounced(search.trim()) || undefined;

  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports });
  // Cada seção tem a sua consulta: o puxão refaz as que estão na tela (esportes e quadras).
  const queryClient = useQueryClient();
  const refreshControl = usePullToRefresh(() =>
    Promise.all([sports.refetch(), queryClient.refetchQueries({ queryKey: ['venues'], type: 'active' })]),
  );
  // "Perto de você" precisa da posição (sort=distance sem lat/lng é 422); sem ela, lista todas.
  const { position, ready } = useUserPosition();
  const near: VenueFilters = position ? { lat: position.latitude, lng: position.longitude, sort: 'distance' } : {};
  const nearPosition: VenueFilters = position ? { lat: position.latitude, lng: position.longitude } : {};

  // Mesma consulta da seção "Disponíveis agora": a primeira (a mais perto) vira o destaque.
  const available = useVenues({ status: 'available', ...near }, ready);
  const highlight = available.data?.data[0];

  const filtering = !!q || sportId !== undefined || quick.size > 0;
  const results: VenueFilters = { q, sport_id: sportId, ...toFilters(quick), ...nearPosition };

  // A vibração vem do próprio FilterChip.
  function toggleQuick(key: QuickFilter) {
    setQuick((cur) => {
      const next = new Set(cur);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearAll() {
    setSearch('');
    setSportId(undefined);
    setQuick(new Set());
  }

  // Abre a aba Mapa com os mesmos filtros ("1" = ligado; "at" faz o mapa aplicar uma vez).
  function seeOnMap() {
    const on = (key: QuickFilter) => (quick.has(key) ? '1' : '');
    router.navigate({
      pathname: '/map',
      params: {
        at: String(Date.now()),
        q: search.trim(),
        sport: sportId !== undefined ? String(sportId) : '',
        available: on('available'),
        free: on('free'),
        covered: on('covered'),
        lighting: on('lighting'),
        leisure: on('leisure'),
      },
    });
  }

  const showRecent = focused && !search && recent.items.length > 0;

  return (
    <Screen contentStyle={styles.content} refreshControl={refreshControl}>
      <Header onShowAvailable={() => !quick.has('available') && toggleQuick('available')} />

      <View style={styles.searchWrap}>
        <View style={[styles.search, fieldBoxStyle(c, focused, false)]}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color={focused ? c.primary : c.textMuted}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
          <TextInput
            accessibilityLabel={t('app_search_ph')}
            placeholder={t('app_search_ph')}
            placeholderTextColor={c.textMuted}
            selectionColor={c.primary}
            cursorColor={c.primary}
            value={search}
            onChangeText={setSearch}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={() => recent.add(search)}
            returnKeyType="search"
            style={[styles.searchInput, { color: c.text }, inputFont]}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={13} accessibilityRole="button" accessibilityLabel={t('app_clear_search')}>
              <MaterialCommunityIcons name="close-circle" size={20} color={c.textMuted} />
            </Pressable>
          ) : null}
        </View>
        {showRecent ? (
          <RecentSearches
            items={recent.items}
            onPick={(term) => {
              setSearch(term);
              recent.add(term);
            }}
            onRemove={recent.remove}
            onClear={recent.clear}
          />
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quick}>
        {QUICK_FILTERS.map((f) => (
          <FilterChip key={f.key} label={t(f.label)} dot={f.dot} selected={quick.has(f.key)} onPress={() => toggleQuick(f.key)} />
        ))}
      </ScrollView>

      <FlatList
        data={sports.data ?? []}
        keyExtractor={(s) => String(s.id)}
        renderItem={({ item }) => (
          <SportChip
            sport={item}
            selected={item.id === sportId}
            // tocar no esporte já selecionado limpa o filtro
            onPress={() => {
              tick();
              setSportId((cur) => (cur === item.id ? undefined : item.id));
            }}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      />

      {filtering ? (
        <Results filters={results} enabled={ready} hasPosition={!!position} onClear={clearAll} onSeeOnMap={seeOnMap} />
      ) : (
        <>
          {available.isPending ? (
            <View style={styles.highlightSkeleton}>
              <Skeleton width="100%" height={290} radius={22} />
            </View>
          ) : highlight ? (
            <Appear>
              <NearestFreeCard venue={highlight} nearest={!!position} />
            </Appear>
          ) : null}

          {ready && !position ? <LocationPrompt /> : null}

          <RecentlyViewedSection />

          <VenueSection title={t(position ? 'app_section_near' : 'app_section_all')} filters={near} enabled={ready} />
          {/* D33: "Mais avaliadas" virou "Disponíveis agora" (avaliação é vitrine). */}
          <VenueSection
            title={t('app_section_available')}
            filters={{ status: 'available', ...near }}
            enabled={ready}
            exclude={highlight?.id}
            onSeeAll={() => toggleQuick('available')}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 0, paddingTop: 20, paddingBottom: 32, gap: 22 },
  header: { paddingHorizontal: SIDE, gap: 4 },
  greeting: { fontSize: 30, lineHeight: 38, fontFamily: fonts.medium },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 28, alignSelf: 'flex-start' },
  summaryText: { fontSize: 15 },
  searchWrap: { paddingHorizontal: SIDE, gap: 8 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, paddingHorizontal: 16, minHeight: 54 },
  searchInput: { flex: 1, paddingVertical: 12 },
  recent: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  recentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentTitle: { fontSize: 13, fontWeight: '700' },
  recentClear: { fontSize: 14, fontWeight: '600', paddingVertical: 10 },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recentPick: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  recentText: { flex: 1, fontSize: 16 },
  quick: { paddingHorizontal: SIDE, gap: 8 },
  chips: { paddingHorizontal: SIDE, gap: 28 },
  chip: { alignItems: 'center' },
  chipCircle: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  chipText: { fontSize: 14 },
  chipLine: { height: 2, alignSelf: 'stretch', marginTop: 4 },
  highlightSkeleton: { paddingHorizontal: SIDE },
  sectionHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingHorizontal: SIDE, marginBottom: 14 },
  sectionTitle: { flexShrink: 1, fontSize: 22, fontFamily: fonts.medium },
  seeAll: { fontSize: 15, fontWeight: '600', paddingVertical: 10 },
  count: { fontSize: 14 },
  tools: { paddingHorizontal: SIDE, gap: 8, alignItems: 'center', marginBottom: 16 },
  toolsDivider: { width: 1, height: 28, marginHorizontal: 4 },
  row: { paddingHorizontal: SIDE, gap: GAP },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: SIDE },
});
