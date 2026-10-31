import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { uploadAvatar } from '@/api/auth';
import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/utils/errorMessage';

const MAX_BYTES = 10 * 1024 * 1024; // contrato: até 10 MB
const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif' };

/**
 * Trocar a foto de perfil: abre a galeria (com recorte quadrado), confere tipo e tamanho
 * antes de enviar e atualiza o user com o que a API devolveu.
 */
export function useChangeAvatar() {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);

  async function change() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8, // foto de perfil não precisa do tamanho original
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    const ext = (asset.fileName ?? asset.uri).split('.').pop()?.toLowerCase() ?? 'jpg';
    const type = asset.mimeType ?? TYPES[ext] ?? 'image/jpeg';
    if (!Object.values(TYPES).includes(type)) {
      return Alert.alert(t('app_photo_error_title'), t('app_photo_type'));
    }
    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      return Alert.alert(t('app_photo_error_title'), t('app_photo_too_big'));
    }

    setUploading(true);
    try {
      const user = await uploadAvatar({ uri: asset.uri, name: asset.fileName ?? `avatar.${ext}`, type });
      updateUser(user);
      showToast(t('app_photo_updated'), t('app_toast_photo_text'));
    } catch (err) {
      const apiError = toApiError(err);
      const message = apiError.code === 'FILE_TOO_LARGE' ? t('app_photo_too_big') : (apiError.field('avatar') ?? errorMessage(err));
      Alert.alert(t('app_photo_error_title'), message);
    } finally {
      setUploading(false);
    }
  }

  return { change, uploading };
}
