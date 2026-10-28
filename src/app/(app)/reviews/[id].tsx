import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { getVenue } from '@/api/venues';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { StarPicker, Stars } from '@/components/Stars';
import { Text, useInputFont } from '@/components/Text';
import { reviewStore, type Review } from '@/showcase/reviews';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { formatDate, formatRating, initials } from '@/utils/format';

// Estrelas em ouro (>= 3:1 sobre os fundos claros); no escuro e no alto contraste, a cor do texto.
const STAR_GOLD = '#B7791F';

function ReviewCard({ review }: { review: Review }) {
  const c = useColors();
  const { t } = useTranslation();
  const starColor = c.scheme === 'dark' || c.highContrast ? c.text : STAR_GOLD;
  const author = review.mine ? `${review.author} (${t('app_chat_you')})` : review.author;
  return (
    <View
      accessible
      accessibilityLabel={[author, t('app_a11y_stars', { count: review.rating }), formatDate(review.at), review.text]
        .filter(Boolean)
        .join(', ')}
      style={[styles.card, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          <Text style={[styles.avatarText, { color: c.onPrimary }]}>{initials(review.author)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={[styles.author, { color: c.text }]}>{author}</Text>
          <Text style={[styles.date, { color: c.textMuted }]}>{formatDate(review.at)}</Text>
        </View>
        <Stars rating={review.rating} color={starColor} size={16} />
      </View>
      {review.text ? <Text style={[styles.reviewText, { color: c.text }]}>{review.text}</Text> : null}
    </View>
  );
}

// Vitrine: avaliações. Nota e total do topo vêm da API (quadra); lista, barras e o
// "Avaliar quadra" são de exemplo e ficam só no celular.
export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venueId = Number(id);
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const inputFont = useInputFont(16);
  const venue = useQuery({ queryKey: ['venue', venueId], queryFn: () => getVenue(venueId) }).data;
  const reviews = reviewStore.useValue(venueId);
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const starColor = c.scheme === 'dark' || c.highContrast ? c.text : STAR_GOLD;
  const mine = reviews.filter((r) => r.mine).length;
  const total = (venue?.ratings_count ?? 0) + mine;
  const counts = [5, 4, 3, 2, 1].map((stars) => reviews.filter((r) => r.rating === stars).length);

  function publish() {
    if (!rating) return setError(t('app_review_choose_rating'));
    setError(null);
    reviewStore.set(venueId, (list) => [
      {
        id: `mine-${Date.now()}`,
        author: user?.name ?? '',
        rating,
        text: text.trim(),
        at: new Date().toISOString(),
        mine: true,
      },
      ...list,
    ]);
    setWriting(false);
    setRating(0);
    setText('');
    AccessibilityInfo.announceForAccessibility(t('app_review_thanks'));
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_reviews_title')} />

      {venue ? (
        <View style={[styles.summary, { backgroundColor: c.surface }, contrastOutline(c)]}>
          <View
            accessible
            accessibilityLabel={`${venue.rating !== null ? t('app_a11y_rating', { rating: formatRating(venue.rating) }) : ''}, ${t('app_reviews_count', { count: total })}`}
            style={styles.average}>
            <Text style={[styles.averageValue, { color: c.text }]}>{formatRating(venue.rating)}</Text>
            {venue.rating !== null ? <Stars rating={venue.rating} color={starColor} size={18} /> : null}
            <Text style={[styles.date, { color: c.textMuted }]}>{t('app_reviews_count', { count: total })}</Text>
          </View>
          {/* Barras por estrela: só visuais, a média já foi lida acima. */}
          <View style={styles.bars} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {counts.map((count, i) => (
              <View key={i} style={styles.barRow}>
                <Text style={[styles.barLabel, { color: c.textMuted }]}>{5 - i}</Text>
                <View style={[styles.barTrack, { backgroundColor: c.divider }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: starColor, width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={[styles.notice, { backgroundColor: c.surface }, contrastOutline(c)]}>
        <MaterialCommunityIcons name="information-outline" size={18} color={c.textMuted} />
        <Text style={[styles.noticeText, { color: c.textMuted }]}>{t('app_review_preview_notice')}</Text>
      </View>

      {writing ? (
        <View style={[styles.form, { borderColor: c.border }]}>
          <Text style={[styles.author, { color: c.text }]}>{t('app_your_rating')}</Text>
          <StarPicker value={rating} onChange={setRating} color={starColor} />
          <TextInput
            accessibilityLabel={t('app_review_ph')}
            placeholder={t('app_review_ph')}
            placeholderTextColor={c.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            style={[styles.textArea, { color: c.text, borderColor: c.border }, inputFont]}
          />
          {error ? (
            <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={{ color: c.danger }}>
              {error}
            </Text>
          ) : null}
          <Button title={t('app_review_publish')} onPress={publish} />
          <Button variant="outline" title={t('app_cancel')} onPress={() => setWriting(false)} />
        </View>
      ) : (
        <Button icon="star-outline" title={t('app_rate_venue')} onPress={() => setWriting(true)} />
      )}

      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  flex: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 22, padding: 18 },
  average: { alignItems: 'center', gap: 4 },
  averageValue: { fontSize: 44, fontFamily: fonts.medium },
  bars: { flex: 1, gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { fontSize: 12, width: 10, textAlign: 'center' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  noticeText: { flex: 1, fontSize: 13 },
  form: { borderWidth: 1.5, borderRadius: 22, padding: 16, gap: 12 },
  textArea: { borderWidth: 1.5, borderRadius: 16, minHeight: 100, padding: 12, textAlignVertical: 'top' },
  card: { borderRadius: 18, padding: 14, gap: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  author: { fontSize: 16, fontWeight: '700' },
  date: { fontSize: 13 },
  reviewText: { fontSize: 15, lineHeight: 22 },
});
