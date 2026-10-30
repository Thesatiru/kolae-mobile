import { MaterialCommunityIcons } from '@expo/vector-icons';
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

const BANNER_ICON = { available: 'check', in_use: 'clock-outline', closed: 'lock-outline' } as const;
const BANNER_TITLE = { available: 'app_available_now', in_use: 'app_status_in_use_now', closed: 'app_status_closed_now' } as const;

/**
 * Faixa do status no topo da agenda: "Em uso agora / Partida até 21:00 · livre a partir das 21:00".
 * O texto de baixo vem de quem usa (depende da agenda); sem ele, só o título ("Fechada agora").
 */
export function StatusBanner({ status, detail }: { status: VenueStatus; detail?: string | null }) {
  const { t } = useTranslation();
  const colors = statusColors[status];
  const title = t(BANNER_TITLE[status]);
  // Fechada usa o cinza escuro no círculo: o cinza do contorno não tem contraste com o ícone branco.
  const circle = status === 'closed' ? colors.text : colors.accent;
  return (
    <View
      accessible
      accessibilityLabel={detail ? `${title}. ${detail}` : title}
      style={[styles.banner, { backgroundColor: colors.background }]}>
      <View style={[styles.bannerIcon, { backgroundColor: circle }]}>
        <MaterialCommunityIcons name={BANNER_ICON[status]} size={26} color="#FFFFFF" />
      </View>
      <View style={styles.bannerText}>
        <Text style={[styles.bannerTitle, { color: colors.text }]}>{title}</Text>
        {detail ? <Text style={[styles.bannerDetail, { color: colors.text }]}>{detail}</Text> : null}
      </View>
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
  banner: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 20, padding: 14 },
  bannerIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1, gap: 2 },
  bannerTitle: { fontSize: 18, fontWeight: '700' },
  bannerDetail: { fontSize: 15, lineHeight: 21 },
});
