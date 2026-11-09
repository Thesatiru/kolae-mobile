import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { listConversations } from '@/api/chat';
import { useAuth } from '@/auth/AuthProvider';
import { conversationsKey } from '@/chat/useChatThread';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { UserAvatar } from '@/components/UserAvatar';
import { useFavorites } from '@/favorites/FavoritesProvider';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

// Aba "Menu" (☰): o que a pessoa usa menos que buscar, ver o mapa e a comunidade.
// A barra fica só com as abas principais; perfil, favoritos e configurações moram aqui.
export default function MenuScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { ids } = useFavorites();
  // Não lidas do chat: atualiza ao voltar para o Menu (a aba fica montada, então sem polling aqui).
  const conversations = useQuery({ queryKey: conversationsKey, queryFn: listConversations });
  const { refetch: refetchConversations } = conversations;
  useFocusEffect(
    useCallback(() => {
      void refetchConversations();
    }, [refetchConversations]),
  );
  const unread = (conversations.data ?? []).reduce((sum, c) => sum + c.unread_count, 0);

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
        <UserAvatar user={user} size={56} />
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
          icon="message-text-outline"
          label={t('app_messages_title')}
          description={t('app_menu_messages_desc')}
          value={unread ? t('app_messages_unread', { count: unread }) : undefined}
          onPress={() => router.push('/messages')}
        />
        <SettingsRow
          icon="crown-outline"
          label={t('app_plans_title')}
          description={t('app_plans_menu_desc')}
          onPress={() => router.push('/plans')}
        />
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
  name: { fontSize: 18, fontWeight: '700' },
});
