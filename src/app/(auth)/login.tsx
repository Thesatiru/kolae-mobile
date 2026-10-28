import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { CurvedHeader } from '@/components/CurvedHeader';
import { LogoMark } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { linkDecoration } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';

export default function LoginScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) return setError(t('app_required'));
    setError(null);
    setLoading(true);
    try {
      await signIn({ email: email.trim(), password }, remember);
      // O layout (auth) redireciona sozinho quando o usuário existe.
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen edges={['bottom']} contentStyle={styles.content}>
      <StatusBar style={c.brandStatusBar} />
      <CurvedHeader>
        <LogoMark color={c.onBrand} colors={c.rainbow} height={width * 0.38} />
      </CurvedHeader>

      <View style={styles.form}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.primary }]}>{t('app_login_title')}</Text>

        <TextField
          label={t('global_email')}
          placeholder={t('app_email_ph')}
          icon="account-outline"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextField
          label={t('global_senha')}
          icon="lock-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
          onSubmitEditing={handleLogin}
        />

        <View style={styles.options}>
          <Checkbox checked={remember} onChange={setRemember} label={t('login_remember')} />
          <Link href="/forgot-password" style={[styles.link, styles.underline, { color: c.text }]}>
            {t('app_forgot')}
          </Link>
        </View>

        {error ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: c.danger }]}>{error}</Text> : null}

        {/* Empurra o botão para baixo, como no design, sem cortar em telas pequenas. */}
        <View style={styles.spacer} />

        <Button title={t('login_btn_entry')} onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={[styles.link, { color: c.textMuted }]}>{t('app_login_no_account')}</Text>
          <Link href="/register" style={[styles.link, { color: c.link }, linkDecoration(c)]}>
            {t('app_login_create')}
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  form: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 48, paddingBottom: 32, gap: 18 },
  title: { fontSize: 30, fontFamily: fonts.regular, textAlign: 'center', marginBottom: 4 },
  options: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 24 },
  link: { fontSize: 15, fontFamily: fonts.regular },
  underline: { textDecorationLine: 'underline' },
  error: { textAlign: 'center' },
  spacer: { flexGrow: 1, minHeight: 24 },
  footer: { alignItems: 'center', gap: 2 },
});
