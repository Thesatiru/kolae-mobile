import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import type { FloorType } from '@/api/types';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';
import { formatPrice } from '@/utils/format';
import { FilterChip } from './FilterChip';

// Filtros extras do mapa (os de GET /venues que não estão nos chips de cima).
export type MapFilters = {
  maxPriceCents?: number; // 0 = só as grátis
  floorType?: FloorType;
  isCovered?: boolean;
  hasLighting?: boolean;
  hasLeisureArea?: boolean;
  radiusKm?: number; // só com a localização da pessoa
};

export const PRICE_CHIP_CENTS = 10000; // chip "Até R$ 100/h" em cima do mapa
const PRICES = [0, 5000, PRICE_CHIP_CENTS, 15000];
const FLOORS: FloorType[] = ['synthetic', 'court', 'sand', 'clay', 'grass', 'wood'];
const RADII = [5, 10, 25, 50];

export function countFilters(f: MapFilters) {
  return Object.values(f).filter((v) => v !== undefined).length;
}

type Props = {
  visible: boolean;
  value: MapFilters;
  hasPosition: boolean;
  onApply: (value: MapFilters) => void;
  onClose: () => void;
};

export function MapFiltersSheet({ visible, value, hasPosition, onApply, onClose }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const { motionReduced } = usePreferences();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState(value);

  // Cada vez que abre, começa dos filtros em uso (sair sem aplicar descarta o rascunho).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setDraft(value);
  }

  const set = <K extends keyof MapFilters>(key: K, v: MapFilters[K]) => setDraft((d) => ({ ...d, [key]: v }));
  const toggle = (key: 'isCovered' | 'hasLighting' | 'hasLeisureArea') => set(key, draft[key] ? undefined : true);
  const priceLabel = (cents: number) =>
    cents === 0 ? t('app_free') : t('app_filter_up_to', { price: formatPrice(cents) });

  return (
    <Modal
      visible={visible}
      transparent
      animationType={motionReduced ? 'none' : 'slide'}
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.backdrop}>
        {/* Tocar fora fecha; para o leitor de tela, o botão Fechar faz o mesmo. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
        <View style={[styles.sheet, { backgroundColor: c.background, paddingBottom: 16 + insets.bottom }]}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              {t('app_filters')}
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel={t('app_close')} onPress={onClose} hitSlop={12}>
              <MaterialCommunityIcons name="close" size={26} color={c.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <Section title={t('app_filter_price')}>
              <FilterChip
                label={t('app_filter_any')}
                selected={draft.maxPriceCents === undefined}
                onPress={() => set('maxPriceCents', undefined)}
              />
              {PRICES.map((cents) => (
                <FilterChip
                  key={cents}
                  label={priceLabel(cents)}
                  selected={draft.maxPriceCents === cents}
                  onPress={() => set('maxPriceCents', cents)}
                />
              ))}
            </Section>

            <Section title={t('app_filter_floor')}>
              <FilterChip
                label={t('app_filter_any')}
                selected={draft.floorType === undefined}
                onPress={() => set('floorType', undefined)}
              />
              {FLOORS.map((floor) => (
                <FilterChip
                  key={floor}
                  label={t(`app_floor_${floor}`)}
                  selected={draft.floorType === floor}
                  onPress={() => set('floorType', floor)}
                />
              ))}
            </Section>

            <Section title={t('app_filter_structure')}>
              <FilterChip label={t('app_covered')} selected={!!draft.isCovered} onPress={() => toggle('isCovered')} />
              <FilterChip
                label={t('app_filter_lighting')}
                selected={!!draft.hasLighting}
                onPress={() => toggle('hasLighting')}
              />
              <FilterChip
                label={t('app_leisure_area')}
                selected={!!draft.hasLeisureArea}
                onPress={() => toggle('hasLeisureArea')}
              />
            </Section>

            {/* O raio exige a posição (radius_km sem lat/lng é 422). */}
            {hasPosition ? (
              <Section title={t('app_filter_distance')}>
                <FilterChip
                  label={t('app_filter_any')}
                  selected={draft.radiusKm === undefined}
                  onPress={() => set('radiusKm', undefined)}
                />
                {RADII.map((km) => (
                  <FilterChip
                    key={km}
                    label={t('app_filter_radius', { count: km })}
                    selected={draft.radiusKm === km}
                    onPress={() => set('radiusKm', km)}
                  />
                ))}
              </Section>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.flex}>
              <Button variant="outline" title={t('app_filter_clear')} onPress={() => setDraft({})} />
            </View>
            <View style={styles.flex}>
              <Button title={t('app_filter_apply')} onPress={() => onApply(draft)} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.text }]}>
        {title}
      </Text>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '700' },
  body: { paddingHorizontal: 22, paddingBottom: 12, gap: 20 },
  section: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  footer: { flexDirection: 'row', gap: 12, paddingHorizontal: 22, paddingTop: 12 },
});
