import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { updateMe } from '@/api/auth';
import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { UserAvatar } from '@/components/UserAvatar';
import i18n from '@/i18n';
import { CoverPattern } from '@/profile/CoverPattern';
import { useChangeAvatar } from '@/profile/useChangeAvatar';
import { coverStore } from '@/showcase/community';
import { linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

const COVER_HEIGHT = 140;
const AVATAR = 104;

/** "2004-05-17" -> "17/05/2004" (pt-br) sem passar por UTC, que mudaria o dia. */
function formatBirthdate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(i18n.language, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Editar perfil: tudo o que se troca no perfil fica aqui. Nome (PATCH /me) e foto
// (POST /me/avatar) são reais; a capa é vitrine. E-mail e data de nascimento só para leitura;
// a data não muda nunca (D09).
export default function EditProfileScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { change, uploading } = useChangeAvatar();
  const { width } = useWindowDimensions();
  const cover = coverStore.useValue(0);
  const [name, setName] = useState(user?.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const changed = name.trim() !== (user?.name ?? '') && name.trim().length > 0;

  async function pickCover() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 7],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) coverStore.set(0, () => result.assets[0].uri);
  }

  async function save() {
    if (!name.trim()) return setError(t('app_required'));
    setError(null);
    setSaving(true);
    try {
      updateUser(await updateMe({ name: name.trim() }));
      AccessibilityInfo.announceForAccessibility(t('app_profile_saved'));
      router.back();
    } catch (err) {
      const apiError = toApiError(err);
      setError(apiError.field('name') ?? apiError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_edit_profile')} />

      {/* Capa (vitrine: a API não tem capa, fica só neste celular) com a foto por cima. */}
      <View style={[styles.cover, { height: COVER_HEIGHT }]}>
        {cover ? (
          <Image source={cover} style={StyleSheet.absoluteFill} contentFit="cover" accessible={false} />
        ) : (
          <CoverPattern width={width - 32} height={COVER_HEIGHT} />
        )}
        <Pressable
          accessibilityRole="button"
          onPress={pickCover}
          style={({ pressed }) => [styles.coverPill, { opacity: pressed ? 0.8 : 1 }]}>
          <MaterialCommunityIcons name="image-outline" size={20} color={c.link} />
          <Text style={[styles.coverPillText, { color: c.link }]}>
            {cover ? t('app_profile_change_cover') : t('app_profile_add_cover')}
          </Text>
        </Pressable>
      </View>

      <View style={styles.photo}>
        <View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('app_a11y_profile_photo', { name: user?.name ?? '' })}
            accessibilityHint={t('app_change_photo')}
            accessibilityState={{ busy: uploading }}
            disabled={uploading}
            onPress={change}
            style={[styles.avatar, { borderColor: c.background }]}>
            <UserAvatar user={user} size={AVATAR} />
            {uploading ? (
              <View style={styles.uploading}>
                <ActivityIndicator color="#FFFFFF" accessibilityLabel={t('app_loading')} />
              </View>
            ) : null}
          </Pressable>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={[styles.camera, { backgroundColor: c.primary, borderColor: c.background }]}>
            <MaterialCommunityIcons name="camera-outline" size={18} color={c.onPrimary} />
          </View>
        </View>
        <Text
          accessibilityRole="button"
          onPress={uploading ? undefined : change}
          style={[styles.photoLink, { color: c.link, opacity: uploading ? 0.5 : 1 }, linkDecoration(c)]}>
          {t('app_profile_change_photo')}
        </Text>
        <Text style={[styles.note, { color: c.textMuted }]}>{t('app_profile_cover_preview')}</Text>
      </View>

      <Text style={[styles.label, { color: c.textMuted }]}>{t('register_name')}</Text>
      <TextField
        label={t('register_name')}
        icon="account-outline"
        value={name}
        onChangeText={(v) => {
          setName(v);
          setError(null);
        }}
        autoComplete="name"
        maxLength={255}
        error={error ?? undefined}
      />

      <SettingsGroup>
        <SettingsRow icon="email-outline" label={t('global_email')} value={user?.email} />
        {user?.birthdate ? (
          <SettingsRow
            icon="cake-variant-outline"
            label={t('register_birthday')}
            description={t('app_birthdate_locked')}
            value={formatBirthdate(user.birthdate)}
          />
        ) : null}
      </SettingsGroup>

      <View style={styles.spacer} />
      <Button title={t('app_profile_save')} onPress={save} loading={saving} disabled={!changed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  cover: { borderRadius: 18, overflow: 'hidden' },
  coverPill: {
    position: 'absolute',
    right: 10,
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF', // sobre a capa, como os botões redondos do perfil
    borderRadius: 20,
    paddingHorizontal: 14,
    minHeight: 40,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  coverPillText: { fontSize: 14, fontWeight: '700' },
  photo: { alignItems: 'center', gap: 6, marginTop: -AVATAR / 2 - 14 },
  avatar: { width: AVATAR + 8, height: AVATAR + 8, borderRadius: (AVATAR + 8) / 2, borderWidth: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  uploading: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  camera: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  note: { fontSize: 13, textAlign: 'center' },
  photoLink: { fontSize: 16, fontWeight: '700', padding: 6 },
  label: { fontSize: 14, marginBottom: -6, paddingHorizontal: 4 },
  spacer: { flex: 1, minHeight: 12 },
});
