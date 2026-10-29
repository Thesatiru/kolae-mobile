import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { initials } from '@/utils/format';

// Aba "Menu" (☰): o que a pessoa usa menos que buscar, ver o mapa e a comunidade.
// A barra fica só com as abas principais; perfil, favoritos e configurações moram aqui.
export default function MenuScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ids } = useFavorites();

  return (
    <Screen contentStyle={styles.content}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {t('app_tab_menu')}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${user?.name}, ${t('app_menu_profile_desc')}`}
        onPress={() => router.push('/profile')}
        style={({ pressed }) => [
          styles.profile,
          { backgroundColor: c.surface, opacity: pressed ? 0.6 : 1 },
          contrastOutline(c),
        ]}>
        <View style={[styles.avatar, { backgroundColor: c.primary }]}>
          {user?.avatar_url ? (
            <Image source={user.avatar_url} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
          ) : (
            <Text style={[styles.avatarText, { color: c.onPrimary }]}>{initials(user?.name ?? '')}</Text>
          )}
        </View>
        <View style={styles.flex}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 14 }} numberOfLines={1}>
            {t('app_menu_profile_desc')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color={c.textMuted} />
      </Pressable>

      <SettingsGroup>
        <SettingsRow
          icon="heart-outline"
          label={t('app_tab_favorites')}
          description={t('app_menu_favorites_desc')}
          value={ids.size ? String(ids.size) : undefined}
          onPress={() => router.push('/favorites')}
        />
        <SettingsRow
          icon="cog-outline"
          label={t('app_settings')}
          description={t('app_menu_settings_desc')}
          onPress={() => router.push('/settings')}
        />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon="help-circle-outline"
          label={t('app_help_center')}
          description={t('app_menu_help_desc')}
          onPress={() => router.push('/settings/help')}
        />
        <SettingsRow
          icon="school-outline"
          label={t('app_tour_replay')}
          description={t('app_menu_tour_desc')}
          onPress={() => router.push('/tour')}
        />
      </SettingsGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  flex: { flex: 1 },
  title: { fontSize: 28, fontFamily: fonts.medium, paddingHorizontal: 4 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 20, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
});
