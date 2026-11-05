import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import type { VenueStatus } from '@/api/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { dayKey } from '@/utils/date';
import { formatDecimal } from '@/utils/format';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Exemplos fixos (não vêm da API): só mostram, antes do login, o que o app faz.
const DEMO: { sport: string; icon: IconName; km: number; status: VenueStatus; hour: number }[] = [
  { sport: 'app_auth_demo_society', icon: 'soccer', km: 1.2, status: 'available', hour: 19 },
  { sport: 'app_auth_demo_beach', icon: 'tennis', km: 0.8, status: 'in_use', hour: 21 },
  { sport: 'app_auth_demo_basket', icon: 'basketball', km: 2.5, status: 'available', hour: 22 },
];

const CYCLE_MS = 2800;

// Fuso de Brasília (D16), como a API manda: o StatusBadge mostra a hora que vem na data.
const untilToday = (hour: number) => `${dayKey(new Date())}T${String(hour).padStart(2, '0')}:00:00-03:00`;

// Cartão de quadra de mentira que vai trocando no topo do login ("Disponível · até 19:00").
// Decorativo: escondido do leitor de tela. Com movimento reduzido, fica parado no primeiro
// (conteúdo que troca sozinho atrapalha quem precisa de mais tempo para ler).
export function LiveTicker() {
  const { t } = useTranslation();
  const c = useColors();
  const { motionReduced } = usePreferences();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (motionReduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % DEMO.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [motionReduced]);

  const item = DEMO[index];
  // Nos temas em que o topo tem a cor do fundo (Neutro claro), a borda separa o cartão.
  const outline = c.brand === c.background ? { borderWidth: 1, borderColor: c.divider } : null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.card, { backgroundColor: c.background }, outline, contrastOutline(c)]}>
      <Animated.View
        key={index}
        entering={motionReduced ? undefined : FadeInDown.springify().damping(18)}
        exiting={motionReduced ? undefined : FadeOutUp.duration(180)}
        style={styles.row}>
        <View style={[styles.icon, { backgroundColor: c.surface }]}>
          <MaterialCommunityIcons name={item.icon} size={24} color={c.primary} />
        </View>
        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.sport, { color: c.text }]}>
            {t(item.sport)}
          </Text>
          <Text style={[styles.distance, { color: c.textMuted }]}>{`${formatDecimal(item.km)} km`}</Text>
        </View>
        <StatusBadge status={item.status} until={untilToday(item.hour)} />
      </Animated.View>
      <View style={styles.dots}>
        {DEMO.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === index ? c.primary : c.divider }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 1 },
  sport: { fontSize: 16, fontWeight: '700' },
  distance: { fontSize: 13 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
