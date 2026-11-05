import { useEffect } from 'react';
import { ScrollView, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

type BlockProps = { width: DimensionValue; height: number; radius?: number; style?: StyleProp<ViewStyle> };

// Bloco cinza no formato do conteúdo que ainda vai chegar, "respirando" devagar.
// Com movimento reduzido, fica parado.
export function Skeleton({ width, height, radius = 8, style }: BlockProps) {
  const c = useColors();
  const { motionReduced } = usePreferences();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (motionReduced) return;
    opacity.value = withRepeat(withTiming(0.45, { duration: 750, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [motionReduced, opacity]);

  const pulse = useAnimatedStyle(() => ({ opacity: opacity.value }));
  // No Alto contraste o surface é igual ao fundo: usa a cor das linhas divisórias.
  const backgroundColor = c.highContrast ? c.divider : c.surface;

  return <Animated.View style={[{ width, height, borderRadius: radius, backgroundColor }, pulse, style]} />;
}

/** O formato do VenueCard: foto, nome, selo de status e a linha de distância e preço. */
export function VenueCardSkeleton({ width = 176 }: { width?: number }) {
  return (
    <View style={{ width, gap: 8 }}>
      <Skeleton width={width} height={Math.round(width * 0.82)} radius={16} />
      <Skeleton width="80%" height={16} />
      <Skeleton width="62%" height={22} radius={12} />
      <Skeleton width="50%" height={13} />
    </View>
  );
}

// Para o leitor de tela, o esqueleto inteiro é um aviso só: "Carregando".
function Loading({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { t } = useTranslation();
  return (
    <View accessible accessibilityLabel={t('app_loading')}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={style}>
        {children}
      </View>
    </View>
  );
}

/** Fileira horizontal de cards carregando (seções da Pesquisar). */
export function VenueRowSkeleton({ count = 3, width = 176 }: { count?: number; width?: number }) {
  return (
    <Loading>
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {Array.from({ length: count }, (_, i) => (
          <VenueCardSkeleton key={i} width={width} />
        ))}
      </ScrollView>
    </Loading>
  );
}

/** Grade de duas colunas carregando (resultados da busca). */
export function VenueGridSkeleton({ count = 4, width }: { count?: number; width: number }) {
  return (
    <Loading style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <VenueCardSkeleton key={i} width={width} />
      ))}
    </Loading>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, gap: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, paddingHorizontal: 20 },
});
