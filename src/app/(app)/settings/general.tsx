import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow, SettingsSection } from '@/components/SettingsList';
import { useEnableLocation } from '@/location/useUserPosition';
import { usePreferences, type ShowcaseToggle } from '@/preferences/PreferencesProvider';

const RADIUS_OPTIONS_KM = [5, 10, 20, 50];

// Vitrine: notificações, raio e Wi-Fi ainda não mudam nada no app.
// Reais: "Usar minha localização" (home, mapa e distância) e "Limpar cache" (apaga as fotos
// de quadras guardadas pelo expo-image).
export default function GeneralSettingsScreen() {
  const { t } = useTranslation();
  const { showcase, setShowcase, useLocation, setUseLocation } = usePreferences();
  const enableLocation = useEnableLocation();
  const [radius, setRadius] = useState(10);

  const toggle = (key: ShowcaseToggle) => ({
    switchValue: showcase[key],
    onSwitch: (v: boolean) => setShowcase(key, v),
  });

  function nextRadius() {
    setRadius((r) => RADIUS_OPTIONS_KM[(RADIUS_OPTIONS_KM.indexOf(r) + 1) % RADIUS_OPTIONS_KM.length]);
  }

  function clearCache() {
    Alert.alert(t('app_clear_cache_confirm'), t('app_clear_cache_text'), [
      { text: t('app_cancel'), style: 'cancel' },
      {
        text: t('app_clear_cache'),
        onPress: async () => {
          await Promise.all([Image.clearDiskCache(), Image.clearMemoryCache()]);
          Alert.alert(t('app_clear_cache_done'));
        },
      },
    ]);
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_general_settings')} />

      <SettingsSection title={t('app_notifications')} />
      <SettingsGroup>
        <SettingsRow label={t('app_notify_nearby')} {...toggle('notifyNearbyMatches')} />
        <SettingsRow
          label={t('app_notify_reminder')}
          description={t('app_notify_reminder_desc')}
          {...toggle('notifyMatchReminder')}
        />
        <SettingsRow label={t('app_notify_news')} {...toggle('notifyNews')} />
      </SettingsGroup>

      <SettingsSection title={t('app_location')} />
      <SettingsGroup>
        <SettingsRow
          label={t('app_use_location')}
          description={t('app_use_location_desc')}
          switchValue={useLocation}
          onSwitch={(on) => (on ? void enableLocation() : setUseLocation(false))}
        />
        <SettingsRow label={t('app_search_radius')} value={`${radius} km`} onPress={nextRadius} />
      </SettingsGroup>

      <SettingsSection title={t('app_data_storage')} />
      <SettingsGroup>
        <SettingsRow label={t('app_photos_wifi')} description={t('app_photos_wifi_desc')} {...toggle('photosOnWifi')} />
        <SettingsRow label={t('app_clear_cache')} onPress={clearCache} accessory="none" />
      </SettingsGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
});
