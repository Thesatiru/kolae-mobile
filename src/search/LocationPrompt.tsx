import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useEnableLocation } from '@/location/useUserPosition';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

// Sem a posição, a Pesquisar não sabe o que é "perto": convida a ligar a localização com o
// mesmo fluxo das Configurações (pede a permissão; se estiver bloqueada, leva aos ajustes).
export function LocationPrompt() {
  const c = useColors();
  const { t } = useTranslation();
  const enable = useEnableLocation();

  return (
    <View style={[styles.card, { backgroundColor: c.surface }, contrastOutline(c)]}>
      <View style={[styles.icon, { backgroundColor: c.background }]}>
        <MaterialCommunityIcons name="map-marker-radius-outline" size={26} color={c.primary} />
      </View>
      <View style={styles.text}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {t('app_location_off_title')}
        </Text>
        <Text style={[styles.body, { color: c.textMuted }]}>{t('app_location_off_text')}</Text>
        <View style={styles.action}>
          <Button compact icon="crosshairs-gps" title={t('app_location_turn_on')} onPress={() => void enable()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 20, borderRadius: 20, padding: 16, flexDirection: 'row', gap: 14 },
  icon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 4 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  action: { alignSelf: 'flex-start', marginTop: 8 },
});
