import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { VenueStatus } from '@/api/types';
import { Text } from '@/components/Text';
import { statusColors } from '@/theme/colors';
import { formatTime } from '@/utils/format';

// Selo "Disponível · até 19:00" / "Em uso · até 21:00" / "Fechada · abre às 8:00".
export function StatusBadge({ status, until }: { status: VenueStatus; until: string | null }) {
  const { t } = useTranslation();
  const colors = statusColors[status];
  const label = t(`app_status_${status}`);
  const time = until ? t(`app_status_${status}_until`, { time: formatTime(until) }) : null;

  return (
    <View accessible style={[styles.badge, { backgroundColor: colors.background }]}>
      {/* Fechada usa bolinha vazada: a cor sozinha não diferencia o status. */}
      <View
        style={[
          styles.dot,
          status === 'closed' ? { borderWidth: 2, borderColor: colors.accent } : { backgroundColor: colors.accent },
        ]}
      />
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
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { fontSize: 13, fontWeight: '700' },
});
