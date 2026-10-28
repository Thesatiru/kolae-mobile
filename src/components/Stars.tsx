import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

// Só visual: quem usa coloca a nota no accessibilityLabel do bloco ("Nota 4,5 de 5").
// 4.5 -> 4 cheias + 1 meia
export function Stars({ rating, color, size = 16 }: { rating: number; color: string; size?: number }) {
  return (
    <View style={styles.row} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {[1, 2, 3, 4, 5].map((i) => (
        <MaterialCommunityIcons
          key={i}
          size={size}
          color={color}
          name={rating >= i ? 'star' : rating >= i - 0.5 ? 'star-half-full' : 'star-outline'}
        />
      ))}
    </View>
  );
}

// Escolha de 1 a 5 estrelas. Para o leitor de tela é um controle ajustável (deslizar para
// cima/baixo muda a nota); para o toque, cada estrela é um botão de 44 px.
export function StarPicker({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const { t } = useTranslation();
  return (
    <View
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={t('app_your_rating')}
      accessibilityValue={{ text: value ? t('app_a11y_stars', { count: value }) : t('app_review_choose_rating') }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) =>
        onChange(Math.max(1, Math.min(5, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))
      }
      style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable key={i} onPress={() => onChange(i)} style={styles.pick} hitSlop={4}>
          <MaterialCommunityIcons name={value >= i ? 'star' : 'star-outline'} size={36} color={color} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  pick: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
});
