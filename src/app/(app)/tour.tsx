import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { AccessibilityInfo, FlatList, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { VenueStatus } from '@/api/types';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';
import { StatusBadge, StatusDot } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { markTourSeen } from '@/onboarding/tourStorage';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline, statusColors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { sportIcon } from '@/utils/sportIcons';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Tutorial do primeiro login (e de Configurações › Como usar o app). Cada passo tem um
// desenho feito com as peças reais do app; o desenho é só ilustração e fica fora do leitor
// de tela, que lê o título e o texto.
const STEPS = ['welcome', 'search', 'map', 'status', 'venue', 'owner', 'yours'] as const;
type Step = (typeof STEPS)[number];

export default function TourScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { motionReduced } = usePreferences();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Step>>(null);
  const [index, setIndex] = useState(0);
  const last = index === STEPS.length - 1;

  // Nomes reais das abas e botões, para o texto bater com o que a pessoa vê.
  const names = {
    search: t('app_tab_search'),
    map: t('app_tab_map'),
    favorites: t('app_tab_favorites'),
    profile: t('app_tab_profile'),
    available: t('app_section_available'),
    schedule: t('app_schedule'),
  };

  function show(next: number) {
    setIndex(next);
    listRef.current?.scrollToIndex({ index: next, animated: !motionReduced });
    AccessibilityInfo.announceForAccessibility(
      `${t('app_tour_step', { current: next + 1, total: STEPS.length })}. ${t(`app_tour_${STEPS[next]}_title`)}`,
    );
  }

  async function finish() {
    if (user) await markTourSeen(user.id);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.background }]}>
      <View style={styles.top}>
        <Text style={[styles.step, { color: c.textMuted }]}>
          {t('app_tour_step', { current: index + 1, total: STEPS.length })}
        </Text>
        {!last ? (
          <Text accessibilityRole="button" onPress={finish} suppressHighlighting style={[styles.skip, { color: c.link }]}>
            {t('app_tour_skip')}
          </Text>
        ) : null}
      </View>

      <FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(s) => s}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <ScrollView style={{ width }} contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[styles.visual, { backgroundColor: c.surface }, contrastOutline(c)]}>
              <Visual step={item} />
            </View>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {t(`app_tour_${item}_title`)}
            </Text>
            <Text style={[styles.text, { color: c.textMuted }]}>{t(`app_tour_${item}_text`, names)}</Text>
          </ScrollView>
        )}
      />

      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {STEPS.map((s, i) => (
          <View
            key={s}
            style={[styles.dot, i === index ? { width: 22, backgroundColor: c.primary } : { backgroundColor: c.border }]}
          />
        ))}
      </View>

      <View style={styles.buttons}>
        {index > 0 ? (
          <View style={styles.flex}>
            <Button variant="outline" title={t('app_tour_back')} onPress={() => show(index - 1)} />
          </View>
        ) : null}
        <View style={styles.flex}>
          <Button title={last ? t('app_tour_start') : t('app_tour_next')} onPress={last ? finish : () => show(index + 1)} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Visual({ step }: { step: Step }) {
  const c = useColors();
  const { t } = useTranslation();

  switch (step) {
    case 'welcome':
      return (
        <View style={[styles.logoCircle, { backgroundColor: c.brand }]}>
          <LogoMark color={c.onBrand} colors={c.rainbow} height={120} />
        </View>
      );
    case 'search':
      return (
        <View style={styles.column}>
          <View style={[styles.fakeSearch, { backgroundColor: c.background }]}>
            <Text style={{ color: c.textMuted, fontSize: 15 }}>{t('app_search_ph')}</Text>
            <MaterialCommunityIcons name="magnify" size={22} color={c.text} />
          </View>
          <View style={styles.row}>
            {['fa-futbol', 'fa-basketball', 'fa-volleyball'].map((icon, i) => (
              <View
                key={icon}
                style={[styles.sportCircle, { backgroundColor: i === 0 ? c.selected : c.background }]}>
                <MaterialCommunityIcons name={sportIcon(icon)} size={26} color={i === 0 ? c.onSelected : c.text} />
              </View>
            ))}
          </View>
        </View>
      );
    case 'map':
      return (
        <View style={styles.fakeMap}>
          <View style={[styles.road, styles.roadH, { backgroundColor: c.background }]} />
          <View style={[styles.road, styles.roadV, { backgroundColor: c.background }]} />
          <FakePin status="available" label="R$ 80" style={{ top: 30, left: 20 }} />
          <FakePin status="in_use" label="R$ 120" selected style={{ top: 92, right: 18 }} />
          <FakePin status="closed" label={t('app_free')} style={{ bottom: 26, left: 44 }} />
        </View>
      );
    case 'status':
      return (
        <View style={styles.column}>
          {(['available', 'in_use', 'closed'] as VenueStatus[]).map((status) => (
            <StatusBadge key={status} status={status} until={null} />
          ))}
        </View>
      );
    case 'venue':
      return (
        <View style={[styles.fakeBar, { backgroundColor: c.background }]}>
          <Text style={{ color: c.text, fontSize: 20, fontWeight: '800' }}>
            R$ 80<Text style={{ color: c.textMuted, fontSize: 14, fontWeight: '400' }}>{t('app_per_hour')}</Text>
          </Text>
          <Button compact icon="calendar-blank-outline" title={t('app_schedule')} onPress={() => {}} />
        </View>
      );
    case 'owner':
      return (
        <View style={styles.column}>
          <MaterialCommunityIcons name="whatsapp" size={48} color={c.primary} />
          <Button compact variant="outline" icon="whatsapp" title={t('app_talk_to_owner')} onPress={() => {}} />
        </View>
      );
    case 'yours':
      return (
        <View style={styles.row}>
          {(['heart', 'cog-outline', 'format-size', 'palette-outline'] as IconName[]).map((icon) => (
            <View key={icon} style={[styles.sportCircle, { backgroundColor: c.background }]}>
              <MaterialCommunityIcons name={icon} size={26} color={icon === 'heart' ? c.primary : c.text} />
            </View>
          ))}
        </View>
      );
  }
}

// Igual ao pino do mapa (MapPin), sem o Marker.
function FakePin({
  status,
  label,
  selected,
  style,
}: {
  status: VenueStatus;
  label: string;
  selected?: boolean;
  style: object;
}) {
  const c = useColors();
  const fill = statusColors[status].accent;
  return (
    <View style={[styles.pin, { backgroundColor: selected ? fill : c.background }, style]}>
      <StatusDot status={status} size={10} color={selected ? '#FFFFFF' : undefined} />
      <Text style={{ color: selected ? '#FFFFFF' : c.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    minHeight: 48,
  },
  step: { fontSize: 14 },
  skip: { fontSize: 16, fontWeight: '700', padding: 8, margin: -8 },
  page: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 16, gap: 16 },
  visual: { height: 240, borderRadius: 24, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 8 },
  title: { fontSize: 28, fontFamily: fonts.medium, textAlign: 'center' },
  text: { fontSize: 17, lineHeight: 26, textAlign: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  buttons: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 16 },
  logoCircle: { width: 180, height: 180, borderRadius: 90, alignItems: 'center', justifyContent: 'center' },
  column: { alignItems: 'center', gap: 14 },
  row: { flexDirection: 'row', gap: 16 },
  fakeSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 24,
    borderRadius: 24,
    paddingHorizontal: 18,
    minHeight: 46,
    minWidth: 220,
  },
  sportCircle: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  fakeMap: { alignSelf: 'stretch', flex: 1 },
  road: { position: 'absolute' },
  roadH: { left: 0, right: 0, top: 120, height: 14 },
  roadV: { top: 0, bottom: 0, left: '55%', width: 14 },
  pin: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fakeBar: { flexDirection: 'row', alignItems: 'center', gap: 20, borderRadius: 20, padding: 18 },
});
