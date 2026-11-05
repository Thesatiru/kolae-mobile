import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { usePreferences } from '@/preferences/PreferencesProvider';
import { statusColors } from '@/theme/colors';

// Bolinha "ao vivo" na cor de Disponível: um anel que cresce e some, sem parar.
// Decorativa (o texto ao lado diz o que é). Parada com movimento reduzido.
export function LiveDot() {
  const { motionReduced } = usePreferences();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (motionReduced) return;
    scale.value = withRepeat(withTiming(1.9, { duration: 1100 }), -1, false);
  }, [motionReduced, scale]);

  const ring = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 2 - scale.value }));
  const color = statusColors.available.accent;

  return (
    <View style={styles.dot} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {motionReduced ? null : <Animated.View style={[styles.ring, { borderColor: color }, ring]} />}
      <View style={[styles.core, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
  core: { width: 8, height: 8, borderRadius: 4 },
});
