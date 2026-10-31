import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Expandable } from '@/components/Expandable';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import type { ThemeColors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors, useDarkColors } from '@/theme/useColors';
import { formatPrice } from '@/utils/format';
import { showSoon } from '@/utils/soon';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type Plan = {
  name: 'Plus' | 'Pro';
  monthCents: number;
  yearCents: number;
  benefits: { icon: IconName; key: string }[];
};

// Preços em reais em todos os idiomas: o Kolae é um produto brasileiro.
const PLUS: Plan = {
  name: 'Plus',
  monthCents: 1290,
  yearCents: 11990,
  benefits: [
    { icon: 'ticket-percent-outline', key: 'plus_discount' },
    { icon: 'account-star-outline', key: 'plus_profile' },
    { icon: 'cancel', key: 'plus_ads' },
  ],
};
const PRO: Plan = {
  name: 'Pro',
  monthCents: 2990,
  yearCents: 27990,
  benefits: [
    { icon: 'check-all', key: 'pro_all' },
    { icon: 'calendar-plus', key: 'pro_events' },
    { icon: 'trophy-outline', key: 'pro_tournaments' },
    { icon: 'card-account-details-star-outline', key: 'pro_athlete' },
  ],
};

// Planos (vitrine, D04): nada chama a API e nenhuma cobrança é feita; "Assinar" avisa "em breve".
export default function PlansScreen() {
  const c = useColors();
  const { t } = useTranslation();

  return (
    <Screen backgroundColor={c.surface} contentStyle={styles.content}>
      <PageHeader title={t('app_plans_title')} />
      <Text style={[styles.intro, { color: c.textMuted }]}>{t('app_plans_intro')}</Text>
      <View style={[styles.preview, { backgroundColor: c.background }]}>
        <Text style={[styles.previewText, { color: c.link }]}>{t('app_plans_preview')}</Text>
      </View>

      <PlanCard plan={PLUS} />
      <PlanCard plan={PRO} dark />

      <Text style={[styles.footer, { color: c.textMuted }]}>{t('app_plans_footer')}</Text>
    </Screen>
  );
}

// Plus: cartão claro do tema. Pro: cartão escuro, com a versão escura do tema escolhido (assim o
// destaque, o texto e o botão mantêm contraste AA também no Neutro e no Alto contraste).
function PlanCard({ plan, dark }: { plan: Plan; dark?: boolean }) {
  const themed = useColors();
  const darkColors = useDarkColors();
  const c: ThemeColors = dark ? darkColors : themed;
  const { t } = useTranslation();
  const month = formatPrice(plan.monthCents) ?? '';
  const year = formatPrice(plan.yearCents) ?? '';
  const subscribe = plan.name === 'Plus' ? t('app_plans_subscribe_plus') : t('app_plans_subscribe_pro');

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: c.background, borderColor: c.highContrast ? c.text : dark ? c.border : c.divider },
        c.highContrast && styles.cardContrast,
      ]}>
      <View style={styles.cardHeader}>
        <Text accessibilityRole="header" style={[styles.planName, { color: c.text }]}>
          Kolae <Text style={{ color: c.link }}>{plan.name}</Text>
        </Text>
        {dark ? (
          // Selo pequeno: link do tema escuro com texto escuro (o branco sobre o azul da marca não
          // chega a 4,5:1 em texto pequeno).
          <View style={[styles.badge, { backgroundColor: c.link }]}>
            <Text style={[styles.badgeText, { color: c.background }]}>{t('app_plans_badge_pro')}</Text>
          </View>
        ) : null}
      </View>

      <Text accessible accessibilityLabel={t('app_plans_price_a11y', { month, year })} style={{ color: c.textMuted }}>
        <Text style={[styles.price, { color: c.text }]}>{month}</Text>
        <Text style={styles.priceRest}>{t('app_plans_price_rest', { year })}</Text>
      </Text>

      <View style={styles.benefits}>
        {plan.benefits.map((b) => (
          <Expandable
            key={b.key}
            icon={b.icon}
            title={t(`app_plans_${b.key}_title`)}
            description={t(`app_plans_${b.key}_text`)}
            hint={t('app_plans_expand_hint')}
            colors={c}
          />
        ))}
      </View>

      {/* Botão com as cores da própria paleta do cartão (o Button do app usa sempre o tema da tela). */}
      <Pressable
        accessibilityRole="button"
        onPress={showSoon}
        style={({ pressed }) => [styles.subscribe, { backgroundColor: c.primary, opacity: pressed ? 0.8 : 1 }]}>
        <Text style={[styles.subscribeText, { color: c.onPrimary }]}>{subscribe}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 14 },
  intro: { fontSize: 15, marginTop: -6, paddingHorizontal: 4 },
  preview: { alignSelf: 'stretch', alignItems: 'center', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12 },
  previewText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  card: { borderWidth: 1, borderRadius: 24, padding: 16, gap: 12 },
  cardContrast: { borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  planName: { fontSize: 26, fontFamily: fonts.medium, flexShrink: 1 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  price: { fontSize: 22, fontWeight: '800' },
  priceRest: { fontSize: 14 },
  benefits: { gap: 10 },
  subscribe: { minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  // Texto grande e em negrito (>= 18,7 px mesmo com o texto em 90%): conta como "texto grande" no
  // WCAG, em que 3:1 basta — o branco sobre o azul da marca dá 3,66:1.
  subscribeText: { fontSize: 21, fontFamily: fonts.bold },
  footer: { fontSize: 13, lineHeight: 19, textAlign: 'center', paddingHorizontal: 12, marginTop: 4 },
});
