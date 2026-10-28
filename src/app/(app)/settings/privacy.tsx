import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow, SettingsSection } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';
import { showSoon } from '@/utils/soon';

// Real: alterar senha. Alterar e-mail e dados pessoais entram nas próximas etapas.
// Vitrine: os dois switches. Sem API ainda: sair de todos os aparelhos e excluir conta.
export default function PrivacyScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { user } = useAuth();
  const { showcase, setShowcase } = usePreferences();

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_privacy_security')} />

      <SettingsSection title={t('app_your_account')} />
      <SettingsGroup>
        <SettingsRow icon="email-outline" label={t('app_change_email')} description={user?.email} onPress={showSoon} />
        <SettingsRow
          icon="lock-outline"
          label={t('app_change_password')}
          onPress={() => router.push('/settings/change-password')}
        />
        <SettingsRow
          icon="account-outline"
          label={t('app_personal_data')}
          description={t('app_personal_data_desc')}
          onPress={showSoon}
        />
      </SettingsGroup>

      <SettingsSection title={t('app_who_sees')} />
      <SettingsGroup>
        <SettingsRow
          label={t('app_public_profile')}
          description={t('app_public_profile_desc')}
          switchValue={showcase.publicProfile}
          onSwitch={(v) => setShowcase('publicProfile', v)}
        />
        <SettingsRow
          label={t('app_show_matches')}
          switchValue={showcase.showMatches}
          onSwitch={(v) => setShowcase('showMatches', v)}
        />
      </SettingsGroup>

      <SettingsSection title={t('app_access')} />
      <SettingsGroup>
        <SettingsRow icon="cellphone" label={t('app_signout_all')} onPress={showSoon} accessory="none" />
      </SettingsGroup>

      <View style={styles.spacer} />
      <Button variant="danger" title={t('app_delete_account')} onPress={showSoon} />
      <Text style={[styles.deleteHint, { color: c.textMuted }]}>{t('app_delete_account_desc')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  spacer: { flexGrow: 1, minHeight: 24 },
  deleteHint: { fontSize: 14, textAlign: 'center' },
});
