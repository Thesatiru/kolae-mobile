import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { User } from '@/api/types';
import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';
import { initials } from '@/utils/format';

/**
 * Foto da pessoa ou, sem foto (ou se ela não carregar), as iniciais sobre a cor do tema.
 * Decorativa: quem usa já mostra o nome ao lado.
 */
export function UserAvatar({ user, size }: { user: Pick<User, 'name' | 'avatar_url'> | null; size: number }) {
  const c = useColors();
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = user?.avatar_url;
  const showPhoto = !!url && failedUrl !== url;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.primary }]}>
      {showPhoto ? (
        <Image source={url} style={StyleSheet.absoluteFill} contentFit="cover" onError={() => setFailedUrl(url)} />
      ) : (
        <Text style={{ color: c.onPrimary, fontSize: size * 0.36, fontWeight: '700' }}>{initials(user?.name ?? '')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
