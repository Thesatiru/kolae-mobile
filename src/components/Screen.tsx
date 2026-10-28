import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets, type Edge } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { USE_MOCK } from '@/api/client';
import { Text } from '@/components/Text';
import { useColors } from '@/theme/useColors';

type Props = {
  children: React.ReactNode;
  edges?: Edge[];
  backgroundColor?: string;
  contentStyle?: StyleProp<ViewStyle>;
};

const DEFAULT_PADDING = 24;
const BANNER_SPACE = 28; // altura do aviso de modo de teste + respiro

// Tela com rolagem em que o teclado não cobre os campos.
// Sem 'bottom' em edges, o fim da rolagem ainda reserva o espaço da barra de navegação do
// Android/iPhone (e do aviso de modo de teste), para o último item não ficar por baixo dela.
export function Screen({ children, edges = ['top'], backgroundColor, contentStyle }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const bottomInset = edges.includes('bottom') ? 0 : insets.bottom;
  const flat = StyleSheet.flatten(contentStyle) ?? {};
  const basePadding = Number(flat.paddingBottom ?? flat.paddingVertical ?? flat.padding ?? DEFAULT_PADDING);
  const paddingBottom = basePadding + bottomInset + (USE_MOCK ? BANNER_SPACE : 0);
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: backgroundColor ?? c.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle, { paddingBottom }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
      {USE_MOCK ? (
        <View pointerEvents="none" style={[styles.banner, { bottom: bottomInset + 4, backgroundColor: c.surface }]}>
          <Text style={{ color: c.textMuted, fontSize: 11 }}>{t('app_mock_banner')}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1, padding: DEFAULT_PADDING, gap: 16 },
  banner: { position: 'absolute', alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 10, opacity: 0.85 },
});
