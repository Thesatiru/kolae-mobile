import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/auth/AuthProvider';
import { Appear } from '@/components/Appear';
import { AuthScaffold } from '@/components/AuthScaffold';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { Text } from '@/components/Text';
import { FieldError, TextField, type TextFieldRef } from '@/components/TextField';
import { linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { errorMessage } from '@/utils/errorMessage';

export default function LoginScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextFieldRef>(null);

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
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthScaffold hero title={t('app_login_title')}>
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
          returnKeyType="next"
          submitBehavior="submit"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
      </Appear>
      <Appear index={1}>
        <TextField
          ref={passwordRef}
          label={t('global_senha')}
          icon="lock-outline"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          revealable
          autoComplete="current-password"
          returnKeyType="go"
          onSubmitEditing={handleLogin}
        />
      </Appear>

      <Appear index={2} style={styles.options}>
        <Checkbox checked={remember} onChange={setRemember} label={t('login_remember')} />
        {/* Text com onPress, e não <Link asChild>: o expo-router quebra se o filho do Link tiver lista de estilos. */}
        <Text
          accessibilityRole="link"
          onPress={() => router.push('/forgot-password')}
          style={[styles.link, { color: c.link }, linkDecoration(c)]}>
          {t('app_forgot')}
        </Text>
      </Appear>

      <FieldError message={error ?? undefined} />

      <Appear index={3}>
        <Button title={t('login_btn_entry')} onPress={handleLogin} loading={loading} />
      </Appear>

      {/* Empurra o rodapé para o fim do cartão em telas altas, sem cortar nas pequenas. */}
      <View style={styles.spacer} />

      <Appear index={4} style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textMuted }]}>{t('app_login_no_account')}</Text>
        <Text
          accessibilityRole="link"
          onPress={() => router.push('/register')}
          style={[styles.footerLink, { color: c.link }, linkDecoration(c)]}>
          {t('app_login_create')}
        </Text>
      </Appear>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', columnGap: 12, paddingHorizontal: 2 },
  link: { fontSize: 15, fontWeight: '600', paddingVertical: 12 }, // padding = área de toque de 44 px
  spacer: { flexGrow: 1, minHeight: 4 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 6 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '600', paddingVertical: 12 }, // área de toque de 44 px
});
