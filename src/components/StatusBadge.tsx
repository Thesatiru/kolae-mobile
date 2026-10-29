import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueStatus } from '@/api/types';
import { Text } from '@/components/Text';
import { statusColors } from '@/theme/colors';
import { formatTime } from '@/utils/format';

/** Bolinha do status (selo, pinos do mapa e legenda). Fechada é vazada: a cor sozinha não diferencia. */
export function StatusDot({ status, size = 8, color }: { status: VenueStatus; size?: number; color?: string }) {
  const accent = color ?? statusColors[status].accent;
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        status === 'closed' ? { borderWidth: Math.max(2, size / 4), borderColor: accent } : { backgroundColor: accent },
      ]}
    />
  );
}

// Selo "Disponível · até 19:00" / "Em uso · até 21:00" / "Fechada · abre às 8:00".
export function StatusBadge({ status, until }: { status: VenueStatus; until: string | null }) {
  const { t } = useTranslation();
  const colors = statusColors[status];
  const label = t(`app_status_${status}`);
  const time = until ? t(`app_status_${status}_until`, { time: formatTime(until) }) : null;

  return (
    <View accessible style={[styles.badge, { backgroundColor: colors.background }]}>
      <StatusDot status={status} />
      <Text style={[styles.text, { color: colors.text }]}>{time ? `${label} · ${time}` : label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: { fontSize: 13, fontWeight: '700' },
});
