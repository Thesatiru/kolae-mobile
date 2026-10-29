import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import type { VenueSummary } from '@/api/types';
import { StatusDot } from '@/components/StatusBadge';
import { Text } from '@/components/Text';
import { statusColors } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { formatPrice, formatTime } from '@/utils/format';
import type { Coordinates } from '@/utils/geo';

type Props = {
  venue: VenueSummary & Coordinates;
  selected: boolean;
  onPress: () => void;
};

// Pino em forma de etiqueta: bolinha do status + preço. Selecionado, ganha o fundo da cor do status.
export function MapPin({ venue, selected, onPress }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const colors = statusColors[venue.status];

  // O Android desenha o pino como imagem: redesenha só por um instante depois de mudar.
  const look = `${selected}-${venue.status}-${venue.price_per_hour_cents}`;
  const [drawn, setDrawn] = useState<string | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setDrawn(look), 400);
    return () => clearTimeout(id);
  }, [look]);
  const tracks = drawn !== look;

  const price = formatPrice(venue.price_per_hour_cents);
  const label = price ?? (venue.price_per_hour_cents === 0 ? t('app_free') : t('app_price_ask'));
  // Fechada selecionada usa o cinza escuro: o cinza do selo não tem contraste com texto branco.
  const fill = venue.status === 'closed' ? colors.text : colors.accent;
  const status = [
    t(`app_status_${venue.status}`),
    venue.status_until ? t(`app_status_${venue.status}_until`, { time: formatTime(venue.status_until) }) : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Marker
      coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
      onPress={(e) => {
        e.stopPropagation(); // não deixa o toque chegar no mapa (que desmarcaria a quadra)
        onPress();
      }}
      tracksViewChanges={tracks}
      zIndex={selected ? 2 : 1}
      accessibilityLabel={`${venue.name}, ${status}, ${label}`}>
      <View
        style={[
          styles.pin,
          selected ? { backgroundColor: fill } : { backgroundColor: c.background },
          c.highContrast && { borderWidth: 2, borderColor: c.text },
        ]}>
        <StatusDot status={venue.status} size={10} color={selected ? '#FFFFFF' : undefined} />
        <Text style={[styles.text, { color: selected ? '#FFFFFF' : c.text }]}>{label}</Text>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4, // espaço para a sombra não ser cortada
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  text: { fontSize: 14, fontWeight: '700' },
});
