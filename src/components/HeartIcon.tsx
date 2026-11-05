import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { usePreferences } from '@/preferences/PreferencesProvider';

// Coração de favoritar que "pula" quando a quadra entra nos favoritos (só ao marcar, não ao
// abrir a tela já favoritada). Parado com movimento reduzido.
export function HeartIcon({
  active,
  size,
  color,
  style,
}: {
  active: boolean;
  size: number;
  color: string;
  style?: StyleProp<TextStyle>;
}) {
  const { motionReduced } = usePreferences();
  const scale = useSharedValue(1);
  const previous = useRef(active);

  useEffect(() => {
    const justMarked = active && !previous.current;
    previous.current = active;
    if (!justMarked || motionReduced) return;
    scale.value = withSequence(withSpring(1.4, { damping: 6, stiffness: 400 }), withSpring(1, { damping: 10 }));
  }, [active, motionReduced, scale]);

  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={pop}>
      <MaterialCommunityIcons name={active ? 'heart' : 'heart-outline'} size={size} color={color} style={style} />
    </Animated.View>
  );
}
