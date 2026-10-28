import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { RainbowStripe } from '@/components/Rainbow';
import { Text } from '@/components/Text';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

// "< Título" das telas empilhadas (Configurações e filhas).
export function PageHeader({ title }: { title: string }) {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('app_back')} hitSlop={12} onPress={() => router.back()}>
          <MaterialCommunityIcons name="chevron-left" size={32} color={c.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {c.rainbow ? <RainbowStripe colors={c.rainbow} style={styles.stripe} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 8, marginLeft: -8 },
  title: { flex: 1, fontSize: 28, fontFamily: fonts.medium },
  stripe: { marginTop: 4, marginBottom: 4 },
});
