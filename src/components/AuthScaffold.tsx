import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { CourtLines } from '@/components/CourtLines';
import { LiveTicker } from '@/components/LiveTicker';
import { Logo, LogoMark } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

const CARD_RADIUS = 28;
const RAINBOW_BAND = 5; // espessura de cada faixa do arco-íris na borda do cartão (tema Orgulho)

type Props = {
  title: string;
  subtitle?: string;
  hero?: boolean; // login: frase grande + cartão de quadra "ao vivo" no topo
  back?: boolean | (() => void); // seta no topo; uma função substitui o "voltar" (etapas do cadastro)
  above?: React.ReactNode; // acima do título, dentro do cartão (ex.: progresso das etapas)
  children: React.ReactNode;
};

// Volta para o login que já está embaixo na pilha, em vez de empilhar outro por cima.
export function backToLogin() {
  if (router.canGoBack()) router.back();
  else router.replace('/login');
}

// Moldura das telas sem sessão (login, cadastro, esqueci a senha).
// Topo na cor da marca com linhas de quadra que se desenham, e o formulário num cartão que
// sobe de baixo. O fundo da tela é o do cartão, para o fim da rolagem não aparecer azul.
export function AuthScaffold({ title, subtitle, hero, back, above, children }: Props) {
  const c = useColors();
  const { t } = useTranslation();
  const { motionReduced } = usePreferences();
  const insets = useSafeAreaInsets();
  const onBack = typeof back === 'function' ? back : backToLogin;

  // Topo da mesma cor do cartão (Neutro claro): uma linha fina desenha a curva do cartão.
  const sameAsBrand = c.brand === c.background && !c.highContrast ? { borderWidth: 1, borderBottomWidth: 0, borderColor: c.divider } : null;

  const card = (
    <View style={[styles.card, { backgroundColor: c.background }, sameAsBrand, contrastOutline(c)]}>
      {above}
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.primary }]}>
          {title}
        </Text>
        {subtitle ? <Text style={[styles.subtitle, { color: c.textMuted }]}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );

  // No tema Orgulho, cada cor envolve o cartão com um respiro no topo: a borda vira faixas.
  const framed = (c.rainbow ?? []).reduceRight<React.ReactNode>(
    (inner, color) => <View style={[styles.band, { backgroundColor: color }]}>{inner}</View>,
    card,
  );

  return (
    <Screen edges={[]} contentStyle={styles.content}>
      <StatusBar style={c.brandStatusBar} />
      <View style={[styles.header, { backgroundColor: c.brand, paddingTop: insets.top + 12 }, hero && styles.headerHero]}>
        <CourtLines color={c.onBrand} />

        <View style={styles.topRow}>
          {back ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('app_back')} hitSlop={12} onPress={onBack} style={styles.back}>
              <MaterialCommunityIcons name="chevron-left" size={30} color={c.onBrand} />
            </Pressable>
          ) : null}
          <View style={styles.brand} accessible accessibilityLabel="Kolae">
            <LogoMark color={c.onBrand} colors={c.rainbow} height={34} />
            <Logo color={c.onBrand} colors={c.rainbow} size={26} />
          </View>
        </View>

        {hero ? (
          <Animated.View entering={motionReduced ? undefined : FadeIn.delay(250).duration(500)} style={styles.heroBody}>
            <Text style={[styles.heroTitle, { color: c.onBrand }]}>{t('app_auth_hero')}</Text>
            <LiveTicker />
          </Animated.View>
        ) : null}
      </View>

      {/* Faixa da marca atrás das curvas do cartão. */}
      <View style={[styles.under, { backgroundColor: c.brand }]} />
      <Animated.View entering={motionReduced ? undefined : SlideInDown.springify().damping(22).mass(0.9)} style={styles.grow}>
        {framed}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, paddingBottom: 0, gap: 0 },
  header: { paddingHorizontal: 24, paddingBottom: 36, overflow: 'hidden' },
  headerHero: { paddingBottom: 44 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44 },
  back: { marginLeft: -10, padding: 4 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroBody: { marginTop: 22, gap: 18 },
  heroTitle: { fontSize: 32, lineHeight: 38, fontFamily: fonts.medium },
  under: { height: CARD_RADIUS, marginBottom: -CARD_RADIUS },
  grow: { flexGrow: 1 },
  band: { flexGrow: 1, paddingTop: RAINBOW_BAND, borderTopLeftRadius: CARD_RADIUS, borderTopRightRadius: CARD_RADIUS },
  card: {
    flexGrow: 1,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 16,
  },
  heading: { gap: 6, marginBottom: 4 },
  title: { fontSize: 26, lineHeight: 32, fontFamily: fonts.medium },
  subtitle: { fontSize: 15, lineHeight: 21 },
});
