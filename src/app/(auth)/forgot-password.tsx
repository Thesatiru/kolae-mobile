import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import { Trans, useTranslation } from 'react-i18next';

import { forgotPassword } from '@/api/auth';
import { toApiError } from '@/api/errors';
import { Button } from '@/components/Button';
import { CurvedHeader } from '@/components/CurvedHeader';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { statusColors } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 45;

// iOS abre a caixa de entrada do Mail; no Android o mailto abre o app de e-mail padrão.
const openMailApp = () => Linking.openURL(Platform.OS === 'ios' ? 'message:' : 'mailto:').catch(() => {});

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSend() {
    if (!EMAIL.test(email.trim())) return setError(t('app_invalid_email'));
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  const countdown = `${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`;

  return (
    <Screen edges={['bottom']} contentStyle={styles.content}>
      <StatusBar style={c.brandStatusBar} />
      <CurvedHeader>
        <Logo color={c.onBrand} colors={c.rainbow} size={64} />
      </CurvedHeader>

      <View style={styles.body}>
        {sent ? (
          <>
            <View style={[styles.iconCircle, { backgroundColor: statusColors.available.background }]}>
              <MaterialCommunityIcons name="email-outline" size={36} color={c.primary} />
            </View>
            <Text accessibilityRole="header" style={[styles.title, { color: c.primary }]}>{t('app_forgot_sent_title')}</Text>
            <Text style={[styles.text, { color: c.textMuted }]}>
              <Trans
                i18nKey="app_forgot_sent"
                values={{ email: email.trim() }}
                components={{ b: <Text style={{ color: c.text, fontWeight: '700' }} /> }}
              />
            </Text>
            <Button title={t('app_forgot_open_mail')} onPress={openMailApp} />
            <Button
              variant="outline"
              title={cooldown > 0 ? t('app_forgot_resend_in', { time: countdown }) : t('app_forgot_resend')}
              onPress={handleSend}
              loading={loading}
              disabled={cooldown > 0}
            />
            {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.text, { color: c.danger }]}>{error}</Text> : null}
          </>
        ) : (
          <>
            <Text accessibilityRole="header" style={[styles.title, { color: c.primary }]}>{t('app_forgot_title')}</Text>
            <Text style={[styles.text, { color: c.textMuted }]}>{t('app_forgot_text')}</Text>
            <TextField
              label={t('global_email')}
              placeholder={t('app_email_ph')}
              icon="email-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              error={error ?? undefined}
              onSubmitEditing={handleSend}
            />
            <Button title={t('app_forgot_send')} onPress={handleSend} loading={loading} />
          </>
        )}

        <View style={styles.spacer} />
        <Link href="/login" style={[styles.back, { color: c.link }]}>
          {t('app_back_to_login')}
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  body: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 36, paddingBottom: 40, gap: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, fontFamily: fonts.bold, textAlign: 'center' },
  text: { fontSize: 16, lineHeight: 23, textAlign: 'center' },
  spacer: { flexGrow: 1, minHeight: 24 },
  back: { fontSize: 16, fontWeight: '600', textAlign: 'center', textDecorationLine: 'underline' },
});
