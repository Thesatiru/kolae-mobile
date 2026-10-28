import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { changePassword, forgotPassword } from '@/api/auth';
import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { Button } from '@/components/Button';
import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useColors } from '@/theme/useColors';

const MIN_LENGTH = 6;

function Rule({ ok, label }: { ok: boolean; label: string }) {
  const c = useColors();
  const { t } = useTranslation();
  return (
    <View accessible accessibilityLabel={`${label}, ${ok ? t('app_a11y_met') : t('app_a11y_not_met')}`} style={styles.rule}>
      <MaterialCommunityIcons
        name={ok ? 'check' : 'circle-outline'}
        size={ok ? 22 : 20}
        color={ok ? c.primary : c.textMuted}
      />
      <Text style={{ color: ok ? c.text : c.textMuted, fontSize: 15 }}>{label}</Text>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<{ current?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const rules = {
    length: password.length >= MIN_LENGTH,
    different: password.length > 0 && password !== current,
    match: password.length > 0 && password === confirmation,
  };
  const valid = current.length > 0 && rules.length && rules.different && rules.match;

  async function handleSave() {
    if (!valid) return;
    setErrors({});
    setLoading(true);
    try {
      await changePassword({ current_password: current, password, password_confirmation: confirmation });
      Alert.alert(t('app_password_changed'));
      router.back();
    } catch (err) {
      const apiError = toApiError(err);
      const currentError = apiError.field('current_password');
      const passwordError = apiError.field('password');
      setErrors({
        current: currentError,
        password: passwordError,
        form: currentError || passwordError ? undefined : apiError.message,
      });
    } finally {
      setLoading(false);
    }
  }

  // Quem esqueceu a senha atual recebe o link no e-mail da conta, sem sair do app.
  async function handleForgot() {
    if (!user) return;
    try {
      await forgotPassword(user.email);
      Alert.alert(t('app_forgot_sent_title'), t('app_forgot_sent_plain', { email: user.email }));
    } catch (err) {
      Alert.alert(toApiError(err).message);
    }
  }

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_change_password')} />
      <Text style={[styles.intro, { color: c.textMuted }]}>{t('app_change_password_text')}</Text>

      <TextField
        label={t('app_current_password')}
        icon="lock-outline"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        revealable
        autoComplete="current-password"
        error={errors.current}
      />
      <TextField
        label={t('app_new_password')}
        icon="lock-outline"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        revealable
        autoComplete="new-password"
        error={errors.password}
      />
      <TextField
        label={t('app_confirm_new_password')}
        icon="lock-outline"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        revealable
        autoComplete="new-password"
        onSubmitEditing={handleSave}
      />

      <View style={styles.rules}>
        <Rule ok={rules.length} label={t('app_rule_min', { count: MIN_LENGTH })} />
        <Rule ok={rules.different} label={t('app_rule_different')} />
        <Rule ok={rules.match} label={t('app_rule_match')} />
      </View>

      {errors.form ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.center, { color: c.danger }]}>{errors.form}</Text> : null}

      <View style={styles.spacer} />
      <Button title={t('app_save_password')} onPress={handleSave} loading={loading} disabled={!valid} />
      <Text accessibilityRole="link" onPress={handleForgot} style={[styles.forgot, { color: c.link }]}>
        {t('app_forgot_current')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },
  intro: { fontSize: 16, lineHeight: 23 },
  rules: { gap: 10, paddingHorizontal: 10 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  center: { textAlign: 'center' },
  spacer: { flexGrow: 1, minHeight: 24 },
  forgot: { fontSize: 16, fontWeight: '600', textAlign: 'center', textDecorationLine: 'underline' },
});
