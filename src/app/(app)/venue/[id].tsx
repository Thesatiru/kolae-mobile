import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { getVenue, listSports } from '@/api/venues';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { formatDecimal, formatPrice, formatRating, formatTime, initials, monthsSince } from '@/utils/format';
import { mapsUrl } from '@/utils/maps';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const ABOUT_PREVIEW_LINES = 4;

function CircleButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.circleButton}>
      <MaterialCommunityIcons name={icon} size={22} color="#111111" />
    </Pressable>
  );
}

function Feature({ icon, label }: { icon: IconName; label: string }) {
  const c = useColors();
  return (
    <View accessible accessibilityLabel={label} style={[styles.feature, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <MaterialCommunityIcons name={icon} size={22} color={c.primary} />
      <Text style={[styles.featureText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

function Photos({ urls, height, name }: { urls: string[]; height: number; name: string }) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  return (
    <>
      <FlatList
        data={urls}
        keyExtractor={(url) => url}
        renderItem={({ item, index: i }) => (
          <Image
            source={item}
            style={{ width, height }}
            contentFit="cover"
            accessible
            accessibilityRole="image"
            accessibilityLabel={t('app_a11y_photo', { index: i + 1, total: urls.length, name })}
          />
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
      />
      {urls.length > 1 ? (
        <View style={styles.counter} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.counterText}>
            {index + 1} / {urls.length}
          </Text>
        </View>
      ) : null}
    </>
  );
}

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { isFavorite, toggle } = useFavorites();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [aboutTruncated, setAboutTruncated] = useState(false);

  const venueId = Number(id);
  const query = useQuery({ queryKey: ['venue', venueId], queryFn: () => getVenue(venueId) });
  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports });
  const venue = query.data;
  const imageHeight = width * 0.78;
  const favorite = isFavorite(venueId);

  function memberSince(iso: string) {
    const months = monthsSince(iso);
    if (months < 1) return t('app_member_new');
    if (months < 12) return months === 1 ? t('app_member_one_month') : t('app_member_months', { count: months });
    const years = Math.floor(months / 12);
    return years === 1 ? t('app_member_one_year') : t('app_member_years', { count: years });
  }

  const venueSports = venue ? (sports.data ?? []).filter((s) => venue.sport_ids.includes(s.id)) : [];
  const location = venue
    ? [venue.address, venue.city, venue.distance_km !== null ? `${formatDecimal(venue.distance_km)} km` : null]
        .filter(Boolean)
        .join(' · ')
    : '';
  const price = venue ? formatPrice(venue.price_per_hour_cents) : null;
  const nextStatus =
    venue?.status_until ? t(`app_status_${venue.status}_next`, { time: formatTime(venue.status_until) }) : null;
  // "/hora" visual vira "por hora" falado
  const bottomLabel = [price ? t('app_a11y_price_per_hour', { price }) : t('app_free'), nextStatus]
    .filter(Boolean)
    .join(', ');

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <StatusBar style="light" />

      <View style={[styles.imageBox, { height: imageHeight, backgroundColor: c.surface }]}>
        {venue ? (
          <Photos
            urls={venue.image_urls.length ? venue.image_urls : [venue.cover_url ?? '']}
            height={imageHeight}
            name={venue.name}
          />
        ) : null}
        <View style={[styles.headerButtons, { top: insets.top + 8 }]} pointerEvents="box-none">
          <CircleButton icon="chevron-left" label={t('app_back')} onPress={() => router.back()} />
          {venue ? (
            <View style={styles.rightButtons}>
              <CircleButton
                icon="share-variant-outline"
                label={t('app_share')}
                onPress={() => Share.share({ message: t('app_share_message', { name: venue.name }) })}
              />
              <CircleButton
                icon={favorite ? 'heart' : 'heart-outline'}
                label={favorite ? t('app_unfavorite') : t('app_favorite')}
                onPress={() => toggle(venueId)}
              />
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={[styles.sheet, { marginTop: imageHeight - 24, backgroundColor: c.background }]}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <QueryState
          loading={query.isPending}
          error={query.error}
          empty={!venue}
          emptyText=""
          onRetry={query.refetch}
          minHeight={240}>
          {venue ? (
            <>
              <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
                {venue.name}
              </Text>
              {location ? (
                <View accessible accessibilityLabel={location} style={styles.row}>
                  <MaterialCommunityIcons name="map-marker-outline" size={16} color={c.textMuted} />
                  <Text style={[styles.muted, { color: c.textMuted }]}>{location}</Text>
                </View>
              ) : null}

              <View style={[styles.row, styles.badges]}>
                <StatusBadge status={venue.status} until={venue.status_until} />
                {/* Abre as avaliações (vitrine), como o "20 avaliações" sublinhado do Figma. */}
                <Pressable
                  accessibilityRole="link"
                  accessibilityLabel={[
                    venue.rating !== null ? t('app_a11y_rating', { rating: formatRating(venue.rating) }) : null,
                    t('app_reviews_count', { count: venue.ratings_count }),
                  ]
                    .filter(Boolean)
                    .join(', ')}
                  accessibilityHint={t('app_reviews_title')}
                  hitSlop={10}
                  onPress={() => router.push({ pathname: '/reviews/[id]', params: { id: String(venueId) } })}
                  style={styles.row}>
                  {venue.rating !== null ? (
                    <>
                      <MaterialCommunityIcons name="star" size={16} color={c.text} />
                      <Text style={[styles.bold, { color: c.text }]}>{formatRating(venue.rating)}</Text>
                    </>
                  ) : null}
                  <Text style={[styles.muted, styles.underline, { color: c.textMuted }]}>
                    {t('app_reviews_count', { count: venue.ratings_count })}
                  </Text>
                </Pressable>
              </View>

              <View style={[styles.hDivider, { backgroundColor: c.divider }]} />

              <View style={styles.features}>
                {venue.floor_type ? <Feature icon="grass" label={t(`app_floor_${venue.floor_type.replace(' ', '_')}`)} /> : null}
                <Feature
                  icon={venue.is_covered ? 'home-roof' : 'weather-sunny'}
                  label={venue.is_covered ? t('app_covered') : t('app_uncovered')}
                />
                <Feature
                  icon={venue.has_lighting ? 'lightbulb-outline' : 'lightbulb-off-outline'}
                  label={venue.has_lighting ? t('app_lighting_night') : t('app_no_lighting')}
                />
                {venue.court_capacity ? (
                  <Feature icon="account-group-outline" label={t('app_players', { count: venue.court_capacity })} />
                ) : null}
              </View>

              {venueSports.length ? (
                <>
                  <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>{t('app_sports')}</Text>
                  <View style={styles.chips}>
                    {venueSports.map((s) => (
                      <View key={s.id} style={[styles.chip, { borderColor: c.border }]}>
                        <Text style={{ color: c.text, fontSize: 14 }}>{s.name}</Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : null}

              {venue.description ? (
                <>
                  <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>{t('app_about')}</Text>
                  <Text
                    style={[styles.about, { color: c.text }]}
                    numberOfLines={aboutOpen ? undefined : ABOUT_PREVIEW_LINES}
                    onTextLayout={(e) => {
                      if (!aboutOpen) setAboutTruncated(e.nativeEvent.lines.length >= ABOUT_PREVIEW_LINES);
                    }}>
                    {venue.description}
                  </Text>
                  {aboutTruncated ? (
                    <Text
                      accessibilityRole="button"
                      style={[styles.link, { color: c.link }]}
                      onPress={() => setAboutOpen((o) => !o)}>
                      {aboutOpen ? t('app_read_less') : t('app_read_more')}
                    </Text>
                  ) : null}
                </>
              ) : null}

              <View style={[styles.hDivider, { backgroundColor: c.divider }]} />

              <Text accessibilityRole="header" style={[styles.sectionTitle, styles.noTopMargin, { color: c.text }]}>{t('app_owner')}</Text>
              <View style={styles.host}>
                {/* Foto/iniciais são decorativas: o nome vem logo ao lado. */}
                {venue.owner.avatar_url ? (
                  <Image source={venue.owner.avatar_url} style={styles.avatar} accessible={false} />
                ) : (
                  <View
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={[styles.avatar, styles.avatarFallback, { backgroundColor: c.primary }]}>
                    <Text style={styles.avatarLetter}>{initials(venue.owner.name)}</Text>
                  </View>
                )}
                <View accessible style={styles.flex}>
                  <Text style={[styles.hostName, { color: c.text }]}>{venue.owner.name}</Text>
                  <Text style={[styles.small, { color: c.textMuted }]}>{memberSince(venue.owner.member_since)}</Text>
                </View>
                {/* Chat é vitrine; o WhatsApp do dono (quando houver) fica dentro dele. */}
                <Pressable
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(venueId) } })}
                  style={[styles.chatButton, { borderColor: c.text }]}>
                  <Text style={[styles.bold, { color: c.text }]}>{t('app_chat')}</Text>
                </Pressable>
              </View>

              <View style={[styles.hDivider, { backgroundColor: c.divider }]} />

              <Text accessibilityRole="header" style={[styles.sectionTitle, styles.noTopMargin, { color: c.text }]}>{t('app_location')}</Text>
              {/* Mapa de verdade entra com o react-native-maps (S3); por ora, só o atalho. */}
              {/* O quadro repete o link de baixo: fica fora do leitor de tela para não ler duas vezes. */}
              <Pressable
                accessible={false}
                importantForAccessibility="no-hide-descendants"
                onPress={() => Linking.openURL(mapsUrl(venue))}
                style={[styles.mapBox, { backgroundColor: c.surface }, contrastOutline(c)]}>
                <MaterialCommunityIcons name="map-marker" size={44} color={c.primary} />
              </Pressable>
              <Pressable
                accessibilityRole="link"
                accessibilityLabel={t('app_open_maps')}
                onPress={() => Linking.openURL(mapsUrl(venue))}
                hitSlop={12}
                style={styles.row}>
                <Text style={[styles.link, { color: c.link }]}>{t('app_open_maps')}</Text>
                <MaterialCommunityIcons name="open-in-new" size={16} color={c.link} />
              </Pressable>
            </>
          ) : null}
        </QueryState>
      </ScrollView>

      {venue ? (
        <View
          style={[
            styles.bottomBar,
            { backgroundColor: c.background, borderTopColor: c.divider, paddingBottom: 16 + insets.bottom },
          ]}>
          <View accessible accessibilityLabel={bottomLabel} style={styles.flex}>
            <Text style={[styles.price, { color: c.text }]}>
              {price ?? t('app_free')}
              {price ? <Text style={[styles.perHour, { color: c.textMuted }]}>{t('app_per_hour')}</Text> : null}
            </Text>
            {nextStatus ? <Text style={[styles.small, { color: c.textMuted }]}>{nextStatus}</Text> : null}
          </View>
          <Button
            compact
            icon="calendar-blank-outline"
            title={t('app_schedule')}
            onPress={() => Alert.alert(t('app_schedule_soon'))}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  imageBox: { position: 'absolute', top: 0, left: 0, right: 0 },
  headerButtons: { position: 'absolute', left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  rightButtons: { flexDirection: 'row', gap: 10 },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  counter: {
    position: 'absolute',
    right: 16,
    bottom: 36,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  counterText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { paddingHorizontal: 22, paddingTop: 24 },
  title: { fontSize: 26, fontFamily: fonts.medium, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badges: { gap: 12, marginTop: 10, flexWrap: 'wrap' },
  muted: { fontSize: 14 },
  small: { fontSize: 12 },
  bold: { fontSize: 14, fontWeight: '700' },
  link: { fontSize: 14, fontWeight: '600', textDecorationLine: 'underline' },
  underline: { textDecorationLine: 'underline' },
  hDivider: { height: 1, marginVertical: 20 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feature: {
    flexBasis: '47%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 46,
  },
  featureText: { flex: 1, fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  noTopMargin: { marginTop: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  about: { fontSize: 15, lineHeight: 24, marginBottom: 6 },
  host: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  hostName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  chatButton: { borderWidth: 1.5, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10 },
  mapBox: { height: 170, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  price: { fontSize: 20, fontWeight: '800' },
  perHour: { fontSize: 14, fontWeight: '400' },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
  },
});
