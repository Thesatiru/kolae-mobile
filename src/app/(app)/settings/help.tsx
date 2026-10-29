import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Alert, LayoutAnimation, Linking, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsSection } from '@/components/SettingsList';
import { Text, useInputFont } from '@/components/Text';
import i18n from '@/i18n';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

// Central de ajuda: perguntas frequentes (texto do app, sem API) e "Ainda precisa de ajuda?",
// que abre o app de e-mail com a mensagem pronta para o contato do Kolae (o mesmo do site).
const SUPPORT_EMAIL = 'kolaee.gg@gmail.com';
const SECTIONS = [
  { title: 'app_faq_section_courts', items: ['free', 'closed', 'map'] },
  { title: 'app_faq_section_rental', items: ['rent', 'match', 'owner'] },
  { title: 'app_faq_section_account', items: ['password', 'birthdate'] },
  { title: 'app_faq_section_app', items: ['appearance', 'location'] },
] as const;

export default function HelpScreen() {
  const c = useColors();
  const { t } = useTranslation();
  const { motionReduced } = usePreferences();
  const { user } = useAuth();
  const inputFont = useInputFont(16);
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Nomes reais de abas, botões e telas, para a resposta bater com o que a pessoa vê.
  const names = {
    search: t('app_tab_search'),
    profile: t('app_tab_profile'),
    talk: t('app_talk_to_owner'),
    forgot: t('app_forgot'),
    appearance: t('app_appearance'),
    general: t('app_general_settings'),
    location: t('app_use_location'),
  };

  // Uma resposta aberta por vez: o balão cresce e o anterior fecha.
  function toggle(id: string) {
    if (!motionReduced) LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((cur) => (cur === id ? null : id));
  }

  // A pessoa ainda revisa e envia pelo app de e-mail; por isso a mensagem fica no campo.
  async function send() {
    if (!message.trim()) return setError(t('app_required'));
    setError(null);
    // Conta, versão e idioma ajudam a equipe a responder sem precisar perguntar.
    const footer = [user?.email, `Kolae ${Constants.expoConfig?.version ?? ''}`, i18n.language].filter(Boolean).join(' · ');
    const url =
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(t('app_help_mail_subject'))}` +
      `&body=${encodeURIComponent(`${message.trim()}\n\n--\n${footer}`)}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(t('app_help_no_mail', { email: SUPPORT_EMAIL }));
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_help_center')} />

      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {t('app_faq_title')}
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <SettingsSection title={t(section.title)} />
          {section.items.map((id) => (
            <FaqItem
              key={id}
              question={t(`app_faq_${id}_q`)}
              answer={t(`app_faq_${id}_a`, names)}
              open={open === id}
              onPress={() => toggle(id)}
            />
          ))}
        </View>
      ))}

      <View style={[styles.support, { backgroundColor: c.surface }, contrastOutline(c)]}>
        <Text accessibilityRole="header" style={[styles.supportTitle, { color: c.text }]}>
          {t('app_help_more_title')}
        </Text>
        <Text style={{ color: c.textMuted, fontSize: 15 }}>{t('app_help_more_text', { email: SUPPORT_EMAIL })}</Text>

        <TextInput
          accessibilityLabel={t('app_help_message_ph')}
          placeholder={t('app_help_message_ph')}
          placeholderTextColor={c.textMuted}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={1000}
          style={[styles.textArea, { color: c.text, borderColor: error ? c.danger : c.border, backgroundColor: c.background }, inputFont]}
        />
        {error ? (
          <Text accessibilityLiveRegion="polite" style={{ color: c.danger }}>
            {error}
          </Text>
        ) : null}
        <Button icon="email-outline" title={t('app_help_send')} onPress={send} />
      </View>
    </Screen>
  );
}

function FaqItem({ question, answer, open, onPress }: { question: string; answer: string; open: boolean; onPress: () => void }) {
  const c = useColors();
  return (
    <View
      style={[
        styles.item,
        { backgroundColor: c.surface },
        // Aberta: borda na cor do destaque (no alto contraste a borda grossa já existe).
        c.highContrast ? contrastOutline(c) : { borderWidth: 1.5, borderColor: open ? c.primary : 'transparent' },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={({ pressed }) => [styles.question, { opacity: pressed ? 0.6 : 1 }]}>
        <Text style={[styles.questionText, { color: c.text }]}>{question}</Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={26}
          color={open ? c.primary : c.textMuted}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
      </Pressable>
      {open ? (
        <View style={styles.answer}>
          <View style={[styles.divider, { backgroundColor: c.divider }]} />
          <Text style={[styles.answerText, { color: c.text }]}>{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 16 },
  title: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  section: { gap: 10 },
  item: { borderRadius: 18, overflow: 'hidden' },
  question: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 16, minHeight: 56 },
  questionText: { flex: 1, fontSize: 16, fontWeight: '600' },
  answer: { paddingHorizontal: 18, paddingBottom: 18, gap: 14 },
  divider: { height: 1 },
  answerText: { fontSize: 15, lineHeight: 23 },
  support: { borderRadius: 22, padding: 18, gap: 12, marginTop: 8 },
  supportTitle: { fontSize: 18, fontWeight: '700' },
  textArea: { minHeight: 110, borderWidth: 1, borderRadius: 14, padding: 14, textAlignVertical: 'top' },
});
