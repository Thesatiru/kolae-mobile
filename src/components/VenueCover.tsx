import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LogoMark } from '@/components/Logo';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

type Props = {
  uri: string | null | undefined;
  style?: StyleProp<ViewStyle>; // tamanho e cantos vêm de quem usa
  logoHeight: number;
  accessibilityLabel?: string; // só quando a foto é informação (ex.: galeria do detalhe)
};

// Foto da quadra ou, sem foto (ou se ela não carregar), a logo do Kolae: cinza no claro,
// branca no escuro e com as faixas do arco-íris no tema Orgulho, como no login.
export function VenueCover({ uri, style, logoHeight, accessibilityLabel }: Props) {
  const c = useColors();
  const { motionReduced } = usePreferences();
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showPhoto = !!uri && failedUri !== uri;

  return (
    <View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      style={[styles.box, { backgroundColor: c.surface }, style]}>
      {showPhoto ? (
        <Image
          source={uri}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={motionReduced ? 0 : 150}
          onError={() => setFailedUri(uri)}
          accessible={false}
        />
      ) : (
        // A logo é decorativa: o nome da quadra já aparece ao lado.
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <LogoMark color={c.scheme === 'dark' ? c.text : c.border} colors={c.rainbow} height={logoHeight} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});
