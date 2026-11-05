import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';

import { Text, useFontScale } from '@/components/Text';
import { useColors } from '@/theme/useColors';
import { tick } from '@/utils/haptics';

type ScrollRef = React.ComponentRef<typeof ScrollView>;

const BASE_ITEM_HEIGHT = 44;
export const WHEEL_VISIBLE = 5; // linhas visíveis: a do meio é a escolhida

/** Altura de cada linha, maior com texto grande (Configurações › Aparência). */
export function useWheelItemHeight() {
  return Math.round(BASE_ITEM_HEIGHT * Math.max(1, useFontScale()));
}

type Props = {
  items: string[];
  index: number;
  onChange: (index: number) => void;
  label: string; // nome da coluna para o leitor de tela ("Data de nascimento, Mês")
  flex?: number;
};

// Uma coluna de roleta (como o seletor de horas do celular): arrasta, encaixa no meio e
// vibra de leve a cada item que passa. As linhas longe do meio ficam menores, inclinadas e
// apagadas. Para o leitor de tela é um controle "ajustável": deslizar para cima/baixo muda o valor.
export function WheelPicker({ items, index, onChange, label, flex = 1 }: Props) {
  const c = useColors();
  const itemHeight = useWheelItemHeight();
  const scrollRef = useRef<ScrollRef>(null);
  const [scrollY] = useState(() => new Animated.Value(index * itemHeight));
  const lastTick = useRef(index); // última linha que passou pelo meio (para a vibração)
  const settled = useRef(index); // última linha escolhida (para não avisar duas vezes)

  // Valor trocado de fora (ex.: dia 31 virou 30 ao escolher um mês menor): leva a roleta até ele.
  useEffect(() => {
    if (index === settled.current) return;
    settled.current = index;
    lastTick.current = index;
    scrollRef.current?.scrollTo({ y: index * itemHeight, animated: true });
  }, [index, itemHeight]);

  const clamp = (i: number) => Math.max(0, Math.min(items.length - 1, i));

  function settle(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = clamp(Math.round(e.nativeEvent.contentOffset.y / itemHeight));
    if (i === settled.current) return;
    settled.current = i;
    onChange(i);
  }

  // Vibração de "catraca" a cada linha que passa pelo meio enquanto rola.
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      const i = Math.max(0, Math.min(items.length - 1, Math.round(value / itemHeight)));
      if (i !== lastTick.current) {
        lastTick.current = i;
        tick();
      }
    });
    return () => scrollY.removeListener(id);
  }, [scrollY, itemHeight, items.length]);

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true });

  function step(delta: number) {
    const i = clamp(index + delta);
    if (i === index) return;
    settled.current = i;
    lastTick.current = i;
    scrollRef.current?.scrollTo({ y: i * itemHeight, animated: false });
    onChange(i);
  }

  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: items[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e: AccessibilityActionEvent) => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
      style={{ flex, height: itemHeight * WHEEL_VISIBLE }}>
      <Animated.ScrollView
        ref={scrollRef}
        importantForAccessibility="no-hide-descendants"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled // dentro da rolagem da tela (Android)
        snapToInterval={itemHeight}
        decelerationRate="fast"
        contentOffset={{ x: 0, y: index * itemHeight }}
        contentContainerStyle={{ paddingVertical: itemHeight * Math.floor(WHEEL_VISIBLE / 2) }}
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}>
        {items.map((item, i) => {
          // Distância (em linhas) até o meio, para encolher, inclinar e apagar.
          const input = [-2, -1, 0, 1, 2].map((d) => (i + d) * itemHeight);
          const opacity = scrollY.interpolate({ inputRange: input, outputRange: [0.2, 0.5, 1, 0.5, 0.2], extrapolate: 'clamp' });
          const scale = scrollY.interpolate({ inputRange: input, outputRange: [0.82, 0.92, 1.1, 0.92, 0.82], extrapolate: 'clamp' });
          const rotateX = scrollY.interpolate({
            inputRange: input,
            outputRange: ['-55deg', '-28deg', '0deg', '28deg', '55deg'],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={item}
              style={[styles.item, { height: itemHeight, opacity, transform: [{ perspective: 500 }, { rotateX }, { scale }] }]}>
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.text, { color: c.text }]}>
                {item}
              </Text>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  text: { fontSize: 19, fontWeight: '600' },
});
