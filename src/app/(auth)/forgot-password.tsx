import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Trans, useTranslation } from 'react-i18next';

import { forgotPassword } from '@/api/auth';
import { Appear } from '@/components/Appear';
import { AuthScaffold, backToLogin } from '@/components/AuthScaffold';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { FieldError, TextField } from '@/components/TextField';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline, linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { errorMessage } from '@/utils/errorMessage';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 45;

// iOS abre a caixa de entrada do Mail; no Android o mailto abre o app de e-mail padrão.
const openMailApp = () => Linking.openURL(Platform.OS === 'ios' ? 'message:' : 'mailto:').catch(() => {});

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { motionReduced } = usePreferences();
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
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const countdown = `${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, '0')}`;

  return (
    <AuthScaffold
      back
      title={sent ? t('app_forgot_sent_title') : t('app_forgot_title')}
      subtitle={sent ? undefined : t('app_forgot_text')}>
      {sent ? (
        <Animated.View key="sent" entering={motionReduced ? undefined : FadeIn.duration(250)} style={styles.step}>
          <Animated.View
            entering={motionReduced ? undefined : ZoomIn.springify().damping(12)}
            style={[styles.iconCircle, { backgroundColor: c.surface }, contrastOutline(c)]}>
            <MaterialCommunityIcons name="email-check-outline" size={44} color={c.primary} />
          </Animated.View>
          <Text style={[styles.sentText, { color: c.textMuted }]}>
            <Trans
              i18nKey="app_forgot_sent"
              values={{ email: email.trim() }}
              components={{ b: <Text style={{ color: c.text, fontWeight: '700' }} /> }}
            />
          </Text>
          <Button title={t('app_forgot_open_mail')} icon="email-open-outline" onPress={openMailApp} />
          <Button
            variant="outline"
            title={cooldown > 0 ? t('app_forgot_resend_in', { time: countdown }) : t('app_forgot_resend')}
            onPress={handleSend}
            loading={loading}
            disabled={cooldown > 0}
          />
          <FieldError message={error ?? undefined} />
        </Animated.View>
      ) : (
        <View style={styles.step}>
          <Appear index={0}>
            <TextField
              label={t('global_email')}
              placeholder={t('app_email_ph')}
              icon="email-outline"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="send"
              error={error ?? undefined}
              onSubmitEditing={handleSend}
            />
          </Appear>
          <Appear index={1} style={styles.action}>
            <Button title={t('app_forgot_send')} onPress={handleSend} loading={loading} />
          </Appear>
        </View>
      )}

      <View style={styles.spacer} />
      <Text
        accessibilityRole="link"
        onPress={backToLogin}
        style={[styles.back, { color: c.link }, linkDecoration(c)]}>
        {t('app_back_to_login')}
      </Text>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  step: { gap: 16 },
  iconCircle: { width: 88, height: 88, borderRadius: 44, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' },
  sentText: { fontSize: 16, lineHeight: 23, textAlign: 'center' },
  action: { marginTop: 8 },
  spacer: { flexGrow: 1, minHeight: 16 },
  back: { fontSize: 15, fontWeight: '600', textAlign: 'center', paddingVertical: 12 }, // área de toque de 44 px
});
