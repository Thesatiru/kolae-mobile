import { StyleSheet, View, useWindowDimensions } from 'react-native';

import { useColors } from '@/theme/useColors';

const RAINBOW_BAND = 7; // espessura de cada faixa do arco-íris na curva

// Cabeçalho da marca (azul no tema Kolae) com a borda de baixo em arco (login e esqueci a senha).
// Uma elipse mais larga que a tela, cortada: só a parte de baixo aparece.
// No tema Orgulho, uma elipse por cor, cada uma um pouco mais alta: as bordas viram faixas.
export function CurvedHeader({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { width } = useWindowDimensions();
  const height = width * 0.52;
  // Círculo achatado com scaleY; o scale é feito a partir do centro, daí o ajuste no top.
  const size = width * 1.3;
  const visibleHeight = width * 0.8;
  const layers = [...(c.rainbow ?? []), c.brand];

  return (
    <View style={[styles.header, { height }]}>
      {layers.map((color, i) => (
        <View
          key={color}
          style={[
            styles.ellipse,
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size / 2,
              left: (width - size) / 2,
              top: height - size / 2 - visibleHeight / 2 - i * RAINBOW_BAND,
              transform: [{ scaleY: visibleHeight / size }],
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  ellipse: { position: 'absolute' },
});
