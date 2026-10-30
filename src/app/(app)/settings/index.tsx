import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { UserAvatar } from '@/components/UserAvatar';
import { languages } from '@/i18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { openLegal, PRIVACY_URL, TERMS_URL } from '@/utils/legal';
import { showSoon } from '@/utils/soon';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const c = useColors();
  const { user, signOut } = useAuth();
  const prefs = usePreferences();
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLanguage = languages.find((l) => l.code === i18n.language)?.name;
  // "Verde · Escuro"; no modo claro fica só a cor
  const themeLabel =
    prefs.themeMode === 'light'
      ? t(`app_theme_${prefs.themeColor}`)
      : `${t(`app_theme_${prefs.themeColor}`)} · ${t(prefs.themeMode === 'dark' ? 'app_theme_dark' : 'app_theme_system')}`;

  function confirmSignOut() {
    Alert.alert(t('app_signout_confirm'), undefined, [
      { text: t('app_cancel'), style: 'cancel' },
      { text: t('app_signout'), style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_settings')} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${user?.name}, ${user?.email}, ${t('app_edit_profile')}`}
        onPress={() => router.push('/profile/edit')}
        style={({ pressed }) => [styles.profile, { backgroundColor: c.surface, opacity: pressed ? 0.6 : 1 }, contrastOutline(c)]}>
        <UserAvatar user={user} size={50} />
        <View style={styles.flex}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 14 }} numberOfLines={1}>
            {user?.email} · {t('app_edit_profile')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={26} color={c.text} />
      </Pressable>

      <SettingsGroup>
        <SettingsRow
          icon="bell-off-outline"
          label={t('app_pause_notifications')}
          switchValue={prefs.showcase.pauseNotifications}
          onSwitch={(v) => prefs.setShowcase('pauseNotifications', v)}
        />
        <SettingsRow icon="tune-variant" label={t('app_general_settings')} onPress={() => router.push('/settings/general')} />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow
          icon="palette-outline"
          label={t('app_appearance')}
          value={themeLabel}
          onPress={() => router.push('/settings/appearance')}
        />
        <SettingsRow
          icon="web"
          label={t('app_language')}
          value={languageOpen ? undefined : currentLanguage}
          bold={languageOpen}
          accessory="expand"
          expanded={languageOpen}
          onPress={() => setLanguageOpen((o) => !o)}>
          {languageOpen ? (
            <View style={[styles.languages, { backgroundColor: c.background }]}>
              {languages.map((lang, i) => {
                const selected = lang.code === i18n.language;
                return (
                  <Pressable
                    key={lang.code}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => prefs.setLanguage(lang.code)}
                    style={[styles.language, i > 0 && { borderTopWidth: 1, borderTopColor: c.divider }]}>
                    <Text
                      style={[
                        styles.languageText,
                        { color: selected ? c.link : c.text, fontWeight: selected ? '700' : '400' },
                      ]}>
                      {lang.name}
                    </Text>
                    {selected ? <MaterialCommunityIcons name="check" size={24} color={c.link} /> : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </SettingsRow>
        <SettingsRow icon="lock-outline" label={t('app_privacy_security')} onPress={() => router.push('/settings/privacy')} />
        <SettingsRow icon="phone-outline" label={t('app_my_contact')} onPress={showSoon} />
      </SettingsGroup>

      <SettingsGroup>
        <SettingsRow icon="school-outline" label={t('app_tour_replay')} onPress={() => router.push('/tour')} />
        <SettingsRow icon="help-circle-outline" label={t('app_help_center')} onPress={() => router.push('/settings/help')} />
        <SettingsRow icon="file-document-outline" label={t('app_terms')} onPress={() => openLegal(TERMS_URL, c)} />
        <SettingsRow icon="shield-outline" label={t('app_privacy_policy')} onPress={() => openLegal(PRIVACY_URL, c)} />
      </SettingsGroup>

      <View style={styles.spacer} />
      <Button icon="login-variant" title={t('app_signout')} onPress={confirmSignOut} />
      <Text style={[styles.version, { color: c.textMuted }]}>Kolae {Constants.expoConfig?.version}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  flex: { flex: 1 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 22, padding: 16 },
  name: { fontSize: 18, fontWeight: '700' },
  languages: { marginHorizontal: 10, marginBottom: 10, borderRadius: 14, overflow: 'hidden' },
  language: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  languageText: { fontSize: 16 },
  spacer: { flexGrow: 1, minHeight: 8 },
  version: { textAlign: 'center', fontSize: 13 },
});
