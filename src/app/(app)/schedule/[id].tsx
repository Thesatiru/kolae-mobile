import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { Schedule, ScheduleSlot, VenueDetail } from '@/api/types';
import { getSchedule, getVenue } from '@/api/venues';
import { Button } from '@/components/Button';
import { QueryState } from '@/components/QueryState';
import { StatusBanner } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { VenueHero } from '@/components/VenueHero';
import { contrastOutline, statusColors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { dayKey, msUntilChange, nextDays } from '@/utils/date';
import { formatClock, formatPrice, formatTime, noPriceLabel } from '@/utils/format';
import i18n from '@/i18n';

const DAYS = 7;

/** Hora atual, atualizada a cada minuto: as faixas que passaram vão apagando sozinhas. */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** "qui." -> "Qui" no idioma do app. */
function shortWeekday(date: Date) {
  const name = date.toLocaleDateString(i18n.language, { weekday: 'short' }).replace('.', '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Texto de baixo da faixa de status. Só junta o que a API mandou (status, status_until e as
 * faixas da agenda de hoje); quem decide o status é sempre a API (D03).
 */
function statusDetail(venue: VenueDetail, today: Schedule | undefined) {
  const t = i18n.t.bind(i18n);
  const until = venue.status_until;
  if (!until) return null; // fechada sem data: só "Fechada agora"
  const time = formatTime(until);
  if (venue.status === 'available') return t('app_status_available_next', { time });
  if (venue.status === 'in_use') {
    // Livre logo depois se a faixa seguinte da agenda de hoje for livre e começar quando a partida acaba.
    const next = today?.slots.find((s) => new Date(s.start).getTime() === new Date(until).getTime());
    const free = next?.status === 'available' ? ` · ${t('app_status_free_from', { time })}` : '';
    return t('app_status_match_until', { time }) + free;
  }
  const opens = new Date(until);
  const [todayKey, tomorrowKey] = nextDays(2).map(dayKey);
  if (dayKey(opens) === todayKey) return t('app_status_closed_next', { time });
  if (dayKey(opens) === tomorrowKey) return t('app_status_opens_tomorrow', { time });
  return t('app_status_opens_day', { day: shortWeekday(opens), time });
}

// Status e agenda do dia (S4): faixa de status, 7 dias e a linha do tempo de
// GET /venues/{id}/schedule. Quem alugou não aparece (privacidade).
export default function ScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const venueId = Number(id);
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const days = nextDays(DAYS);
  const todayKey = dayKey(days[0]);
  const [selected, setSelected] = useState(todayKey);

  // O status vence com o relógio: busca de novo quando status_until passar.
  const venueQuery = useQuery({
    queryKey: ['venue', venueId],
    queryFn: () => getVenue(venueId),
    refetchInterval: (q) => msUntilChange(q.state.data?.status_until),
  });
  const venue = venueQuery.data;
  const todayQuery = useQuery({
    queryKey: ['schedule', venueId, todayKey],
    queryFn: () => getSchedule(venueId, todayKey),
    refetchInterval: () => msUntilChange(venue?.status_until),
  });
  const dayQuery = useQuery({
    queryKey: ['schedule', venueId, selected],
    queryFn: () => getSchedule(venueId, selected),
    enabled: selected !== todayKey, // hoje já vem da consulta de cima
  });
  const schedule = selected === todayKey ? todayQuery : dayQuery;

  // Ao voltar para a tela, atualiza status e agenda (a primeira vez já é a busca inicial).
  const focusedOnce = useRef(false);
  const { refetch: refetchVenue } = venueQuery;
  const { refetch: refetchToday } = todayQuery;
  useFocusEffect(
    useCallback(() => {
      if (focusedOnce.current) {
        void refetchVenue();
        void refetchToday();
      }
      focusedOnce.current = true;
    }, [refetchVenue, refetchToday]),
  );

  const imageHeight = width * 0.62;
  const subtitle = venue
    ? [venue.city, venue.sports[0]?.name, t(`app_floor_${venue.floor_type}`).toLowerCase()].filter(Boolean).join(' · ')
    : '';
  const price = venue ? formatPrice(venue.price_per_hour_cents) : null;
  const whatsapp = venue?.owner.whatsapp;
  const hoursUnknown = venue ? venue.opening_hours.length === 0 : false;
  const data = schedule.data;

  return (
    <View style={[styles.flex, { backgroundColor: c.background }]}>
      <VenueHero venueId={venueId} venue={venue} height={imageHeight} />

      <ScrollView
        style={[styles.sheet, { marginTop: imageHeight - 24, backgroundColor: c.background }]}
        contentContainerStyle={[styles.sheetContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}>
        <QueryState
          loading={venueQuery.isPending}
          error={venueQuery.error}
          empty={!venue}
          emptyText=""
          onRetry={venueQuery.refetch}
          minHeight={240}>
          {venue ? (
            <>
              <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
                {venue.name}
              </Text>
              <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text>

              <StatusBanner status={venue.status} detail={statusDetail(venue, todayQuery.data)} />

              <View style={styles.agendaHeader}>
                <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
                  {t('app_schedule_title')}
                </Text>
                {data && !hoursUnknown ? (
                  <Text style={[styles.range, { color: c.textMuted }]}>
                    {data.opens_at && data.closes_at
                      ? t('app_schedule_open_range', { opens: formatClock(data.opens_at), closes: formatClock(data.closes_at) })
                      : t('app_schedule_closed_day')}
                  </Text>
                ) : null}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
                {days.map((date) => {
                  const key = dayKey(date);
                  const active = key === selected;
                  const top = key === todayKey ? t('app_today') : shortWeekday(date);
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={date.toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
                      onPress={() => setSelected(key)}
                      style={[
                        styles.day,
                        active ? { backgroundColor: c.selected, borderColor: c.selected } : { borderColor: c.border },
                      ]}>
                      <Text style={[styles.dayTop, { color: active ? c.onSelected : c.textMuted }]}>{top}</Text>
                      <Text style={[styles.dayNumber, { color: active ? c.onSelected : c.text }]}>{date.getDate()}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {hoursUnknown ? (
                <Empty icon="clock-alert-outline" title={t('app_hours_unknown')} text={t('app_schedule_hours_unknown_text')} />
              ) : (
                <QueryState
                  loading={schedule.isPending}
                  error={schedule.error}
                  empty={false}
                  emptyText=""
                  onRetry={schedule.refetch}
                  minHeight={180}>
                  {data && data.slots.length && data.closes_at ? (
                    <Timeline slots={data.slots} closesAt={data.closes_at} />
                  ) : (
                    <Empty icon="calendar-remove-outline" title={t('app_schedule_closed_day')} text={t('app_schedule_closed_day_text')} />
                  )}
                </QueryState>
              )}
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
          <View accessible style={styles.flex}>
            <Text style={[styles.price, { color: c.text }]}>
              {price ?? noPriceLabel(venue.price_per_hour_cents)}
              {price ? <Text style={[styles.perHour, { color: c.textMuted }]}>{t('app_per_hour_short')}</Text> : null}
            </Text>
            {whatsapp ? <Text style={[styles.small, { color: c.textMuted }]}>{t('app_rent_direct')}</Text> : null}
          </View>
          {/* Sem WhatsApp cadastrado, o botão não aparece (D24). */}
          {whatsapp ? (
            <Button
              compact
              icon="whatsapp"
              title={t('app_talk_to_owner')}
              accessibilityHint={t('app_chat_whatsapp')}
              onPress={() => Linking.openURL(`https://wa.me/${whatsapp}`)}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// Uma linha por faixa (hora de início + caixa) e, no fim, a hora em que fecha.
function Timeline({ slots, closesAt }: { slots: ScheduleSlot[]; closesAt: string }) {
  const c = useColors();
  const { t } = useTranslation();
  const now = useNow();
  return (
    <View style={styles.timeline}>
      {slots.map((slot) => {
        const start = formatTime(slot.start);
        const end = formatTime(slot.end);
        const past = new Date(slot.end).getTime() <= now;
        const current = !past && new Date(slot.start).getTime() <= now;
        const free = slot.status === 'available';
        const status = free ? t('app_slot_free') : t('app_slot_in_use');
        const label = [
          t('app_a11y_slot', { start, end, status }),
          current ? t('app_time_now') : null,
          past ? t('app_a11y_slot_past') : null,
        ]
          .filter(Boolean)
          .join(', ');
        return (
          // Faixas que já passaram ficam apagadas.
          <View key={slot.start} accessible accessibilityLabel={label} style={[styles.slotRow, past && styles.past]}>
            <Text style={[styles.slotTime, { color: current ? c.text : c.textMuted, fontWeight: current ? '700' : '400' }]}>
              {start}
            </Text>
            {free ? (
              <View style={[styles.slot, { borderColor: statusColors.available.accent, backgroundColor: c.background }]}>
                <Text style={[styles.slotTitle, { color: c.text }]}>{status}</Text>
                <Text style={[styles.slotRange, { color: c.textMuted }]}>{`${start} – ${end}`}</Text>
              </View>
            ) : (
              <View style={[styles.slot, styles.slotFilled, { backgroundColor: statusColors.in_use.background }]}>
                <Text style={[styles.slotTitle, styles.flex, { color: statusColors.in_use.text }]}>{status}</Text>
                <Text style={[styles.slotRange, { color: statusColors.in_use.text }]}>
                  {t('app_status_in_use_until', { time: end })}
                </Text>
              </View>
            )}
          </View>
        );
      })}
      <View accessible style={styles.slotRow}>
        <Text style={[styles.slotTime, { color: c.textMuted }]}>{formatClock(closesAt)}</Text>
        <View style={[styles.slot, styles.slotFilled, { backgroundColor: c.surface }, contrastOutline(c)]}>
          <Text style={[styles.slotRange, { color: c.textMuted }]}>{t('app_status_closed')}</Text>
        </View>
      </View>
    </View>
  );
}

function Empty({ icon, title, text }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; text: string }) {
  const c = useColors();
  return (
    <View accessible style={[styles.empty, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <MaterialCommunityIcons name={icon} size={36} color={c.textMuted} />
      <Text style={[styles.emptyTitle, { color: c.text }]}>{title}</Text>
      <Text style={[styles.emptyText, { color: c.textMuted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sheet: { flex: 1, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  sheetContent: { paddingHorizontal: 22, paddingTop: 28, gap: 16 },
  title: { fontSize: 28, fontFamily: fonts.medium, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginTop: -8 },
  agendaHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  range: { fontSize: 14, flexShrink: 1, textAlign: 'right' },
  days: { gap: 10 },
  day: { width: 58, borderWidth: 1.5, borderRadius: 16, alignItems: 'center', paddingVertical: 10, gap: 2 },
  dayTop: { fontSize: 13 },
  dayNumber: { fontSize: 18, fontWeight: '700' },
  timeline: { gap: 10 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  past: { opacity: 0.45 },
  slotTime: { width: 52, fontSize: 14 },
  slot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  slotFilled: { borderWidth: 0 },
  slotTitle: { fontSize: 15, fontWeight: '700' },
  slotRange: { fontSize: 14 },
  empty: { alignItems: 'center', gap: 8, borderRadius: 18, padding: 22 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptyText: { fontSize: 15, lineHeight: 21, textAlign: 'center' },
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
  price: { fontSize: 20, fontWeight: '800' },
  perHour: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12 },
});
