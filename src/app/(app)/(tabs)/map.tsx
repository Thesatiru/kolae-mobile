import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import MapView, { type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { VenueFilters, VenueStatus, VenueSummary } from '@/api/types';
import { listSports, listVenues } from '@/api/venues';
import { StatusDot } from '@/components/StatusBadge';
import { Text, useInputFont } from '@/components/Text';
import { useEnableLocation, useUserPosition } from '@/location/useUserPosition';
import { FilterChip } from '@/map/FilterChip';
import { MapPin } from '@/map/MapPin';
import { darkMapStyle } from '@/map/darkMapStyle';
import { countFilters, MapFiltersSheet, PRICE_CHIP_CENTS, type MapFilters } from '@/map/MapFiltersSheet';
import { MapVenueCard } from '@/map/MapVenueCard';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';
import { formatPrice } from '@/utils/format';
import { hasCoordinates } from '@/utils/geo';

// Sem a posição da pessoa, o mapa abre na região das quadras de demonstração (Alto Tietê).
const DEFAULT_REGION: Region = { latitude: -23.54, longitude: -46.34, latitudeDelta: 0.2, longitudeDelta: 0.2 };
const NEAR_DELTA = 0.05;
const LEGEND: VenueStatus[] = ['available', 'in_use', 'closed'];

// Busca de novo quando algum status vence (D03: o status muda com o relógio), entre 30 s e 10 min.
function msUntilNextChange(venues: VenueSummary[] | undefined) {
  const next = Math.min(
    ...(venues ?? []).map((v) => (v.status_until ? new Date(v.status_until).getTime() : Infinity)),
  );
  const ms = Number.isFinite(next) ? next - Date.now() + 1000 : 10 * 60_000;
  return Math.min(Math.max(ms, 30_000), 10 * 60_000);
}

function useDebounced<T>(value: T, ms = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function MapScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const inputFont = useInputFont(16);
  const { motionReduced } = usePreferences();
  const mapRef = useRef<MapView>(null);

  const { position, ready, enabled: locationOn, refresh } = useUserPosition();
  const enableLocation = useEnableLocation();
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim()) || undefined;
  const [availableNow, setAvailableNow] = useState(false);
  const [sportId, setSportId] = useState<number | undefined>(undefined);
  const [filters, setFilters] = useState<MapFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const params: VenueFilters = {
    q,
    sport_id: sportId,
    status: availableNow ? 'available' : undefined,
    max_price_cents: filters.maxPriceCents,
    floor_type: filters.floorType,
    is_covered: filters.isCovered,
    has_lighting: filters.hasLighting,
    has_leisure_area: filters.hasLeisureArea,
    per_page: 100, // contrato: para o mapa, 100 por página
    ...(position
      ? { lat: position.latitude, lng: position.longitude, radius_km: filters.radiusKm }
      : {}),
  };

  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports });
  const venues = useQuery({
    queryKey: ['venues', params],
    queryFn: () => listVenues(params),
    enabled: ready, // espera saber se há posição, para não buscar duas vezes
    placeholderData: (previous) => previous, // troca de filtro sem os pinos sumirem
    refetchInterval: (query) => msUntilNextChange(query.state.data?.data),
  });

  // Ao voltar para a aba, atualiza o status (a primeira vez já é a busca inicial).
  const focusedOnce = useRef(false);
  const refetchVenues = venues.refetch;
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) void refetchVenues();
      focusedOnce.current = true;
    }, [refetchVenues]),
  );

  // Quadra sem coordenadas aparece na lista, mas não no mapa.
  const pins = useMemo(() => (venues.data?.data ?? []).filter(hasCoordinates), [venues.data]);
  const selected = pins.find((v) => v.id === selectedId) ?? null;

  // Centraliza uma vez: na pessoa, ou (sem posição) em volta das quadras.
  const centered = useRef(false);
  useEffect(() => {
    if (centered.current || !ready) return;
    if (position) {
      centered.current = true;
      mapRef.current?.animateToRegion({ ...position, latitudeDelta: NEAR_DELTA, longitudeDelta: NEAR_DELTA }, 0);
    } else if (pins.length) {
      centered.current = true;
      mapRef.current?.fitToCoordinates(pins, {
        edgePadding: { top: 220, right: 60, bottom: 260, left: 60 },
        animated: false,
      });
    }
  }, [ready, position, pins]);

  async function goToMe() {
    if (!locationOn) {
      // Desligado em Configurações: explica e oferece ligar ali mesmo.
      Alert.alert(t('app_location_off_title'), t('app_location_off_text'), [
        { text: t('app_cancel'), style: 'cancel' },
        { text: t('app_location_turn_on'), onPress: () => void enableLocation() },
      ]);
      return;
    }
    const me = position ?? (await refresh());
    if (!me) {
      await enableLocation(); // sem permissão: pede de novo ou leva aos ajustes do celular
      return;
    }
    mapRef.current?.animateToRegion(
      { ...me, latitudeDelta: NEAR_DELTA, longitudeDelta: NEAR_DELTA },
      motionReduced ? 0 : 400,
    );
  }

  const extraFilters = countFilters(filters);
  const hcBorder = c.highContrast ? { borderWidth: 2, borderColor: c.text } : null; // botões flutuantes
  const priceChipOn = filters.maxPriceCents === PRICE_CHIP_CENTS;

  return (
    <View style={styles.flex}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={!!position}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        userInterfaceStyle={c.scheme}
        customMapStyle={c.scheme === 'dark' ? darkMapStyle : []}
        onPress={() => setSelectedId(null)}>
        {pins.map((venue) => (
          <MapPin
            key={venue.id}
            venue={venue}
            selected={venue.id === selectedId}
            onPress={() => setSelectedId(venue.id)}
          />
        ))}
      </MapView>

      {/* Topo: busca, filtros e chips */}
      <View style={[styles.top, { paddingTop: insets.top + 12 }]} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={[styles.search, styles.shadow, { backgroundColor: c.background }, hcBorder]}>
            <MaterialCommunityIcons name="magnify" size={24} color={c.text} accessibilityElementsHidden importantForAccessibility="no" />
            <TextInput
              accessibilityLabel={t('app_map_search_ph')}
              placeholder={t('app_map_search_ph')}
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
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={extraFilters ? t('app_filters_count', { count: extraFilters }) : t('app_filters')}
            onPress={() => setFiltersOpen(true)}
            style={[styles.round, styles.shadow, { backgroundColor: c.background }, hcBorder]}>
            <MaterialCommunityIcons name="tune-variant" size={24} color={c.text} />
            {extraFilters ? (
              <View style={[styles.badge, { backgroundColor: c.primary }]}>
                <Text style={[styles.badgeText, { color: c.onPrimary }]}>{extraFilters}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <FilterChip
            floating
            dot
            label={t('app_available_now')}
            selected={availableNow}
            onPress={() => setAvailableNow((on) => !on)}
          />
          {(sports.data ?? []).map((sport) => (
            <FilterChip
              key={sport.id}
              floating
              label={sport.name}
              selected={sport.id === sportId}
              onPress={() => setSportId((cur) => (cur === sport.id ? undefined : sport.id))}
            />
          ))}
          <FilterChip
            floating
            label={t('app_filter_up_to', { price: formatPrice(PRICE_CHIP_CENTS) })}
            selected={priceChipOn}
            onPress={() => setFilters((f) => ({ ...f, maxPriceCents: priceChipOn ? undefined : PRICE_CHIP_CENTS }))}
          />
        </ScrollView>

        {venues.isPending || (venues.isFetching && !pins.length) ? (
          <View style={[styles.notice, styles.shadow, { backgroundColor: c.background }]}>
            <ActivityIndicator color={c.primary} accessibilityLabel={t('app_loading')} />
          </View>
        ) : venues.error ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => venues.refetch()}
            style={[styles.notice, styles.shadow, { backgroundColor: c.background }]}>
            <Text accessibilityLiveRegion="polite" style={{ color: c.text }}>
              {t('app_load_error')} <Text style={{ color: c.link, fontWeight: '700' }}>{t('app_retry')}</Text>
            </Text>
          </Pressable>
        ) : !pins.length ? (
          <View style={[styles.notice, styles.shadow, { backgroundColor: c.background }]}>
            <Text accessibilityLiveRegion="polite" style={{ color: c.text }}>
              {t('app_map_empty')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Base: legenda, minha localização e a quadra escolhida */}
      <View style={styles.bottom} pointerEvents="box-none">
        <View style={styles.bottomRow} pointerEvents="box-none">
          {/* A legenda é só visual: o pino e o card já dizem o status por extenso. */}
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.legend, styles.shadow, { backgroundColor: c.background }]}>
            {LEGEND.map((status) => (
              <View key={status} style={styles.legendRow}>
                <StatusDot status={status} size={12} />
                <Text style={{ color: c.text, fontSize: 14 }}>{t(`app_status_${status}`)}</Text>
              </View>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app_locate_me')}
            onPress={goToMe}
            style={[styles.round, styles.shadow, { backgroundColor: c.background }, hcBorder]}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color={c.text} />
          </Pressable>
        </View>
        {selected ? <MapVenueCard venue={selected} /> : null}
      </View>

      <MapFiltersSheet
        visible={filtersOpen}
        value={filters}
        hasPosition={!!position}
        onApply={(value) => {
          setFilters(value);
          setFiltersOpen(false);
        }}
        onClose={() => setFiltersOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, gap: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 28,
    paddingHorizontal: 18,
    minHeight: 52,
  },
  searchInput: { flex: 1 },
  round: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  chips: { gap: 8, paddingHorizontal: 16, paddingVertical: 4 },
  notice: { alignSelf: 'center', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16 },
  bottom: { position: 'absolute', left: 16, right: 16, bottom: 16, gap: 12 },
  bottomRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  legend: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  shadow: {
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
});
