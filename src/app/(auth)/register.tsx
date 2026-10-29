import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { isOldEnough, MIN_AGE, PASSWORD_MIN_LENGTH } from '@/auth/rules';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { linkDecoration } from '@/theme/colors';
import { fonts } from '@/theme/fonts';
import { useColors } from '@/theme/useColors';
import { brDateToIso, maskDate } from '@/utils/date';

type Field = 'name' | 'email' | 'birthdate' | 'password' | 'password_confirmation';
type Errors = Partial<Record<Field, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { width } = useWindowDimensions();
  const { signUp } = useAuth();

  const [form, setForm] = useState<Record<Field, string>>({
    name: '',
    email: '',
    birthdate: '',
    password: '',
    password_confirmation: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: Field) => (value: string) =>
    setForm((f) => ({ ...f, [field]: field === 'birthdate' ? maskDate(value) : value }));

  // Validação local só para retorno rápido; quem decide de verdade é a API (422).
  function validate(): Errors {
    const e: Errors = {};
    if (!form.name.trim()) e.name = t('app_required');
    if (!EMAIL.test(form.email.trim())) e.email = t('app_invalid_email');
    const birthdate = brDateToIso(form.birthdate);
    if (!birthdate) e.birthdate = t('app_invalid_date');
    else if (!isOldEnough(birthdate)) e.birthdate = t('app_min_age', { count: MIN_AGE });
    if (form.password.length < PASSWORD_MIN_LENGTH) e.password = t('app_password_min', { count: PASSWORD_MIN_LENGTH });
    if (form.password !== form.password_confirmation) e.password_confirmation = t('app_password_mismatch');
    return e;
  }

  async function handleRegister() {
    const local = validate();
    setErrors(local);
    setFormError(null);
    if (Object.keys(local).length) return;

    setLoading(true);
    try {
      await signUp({
        name: form.name.trim(),
        email: form.email.trim(),
        birthdate: brDateToIso(form.birthdate)!,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
    } catch (err) {
      const apiError = toApiError(err);
      const fields: Errors = {};
      (Object.keys(form) as Field[]).forEach((f) => {
        const msg = apiError.field(f);
        if (msg) fields[f] = msg;
      });
      setErrors(fields);
      if (!Object.keys(fields).length) setFormError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  // Bloco 1,5x mais largo que a tela com cantos enormes = a curva do design.
  const arc = { width: width * 1.5, borderTopLeftRadius: width * 0.75, borderTopRightRadius: width * 0.75 };
  const panel = (
    <View style={[styles.curve, arc, { backgroundColor: c.background }]}>
      <View style={[styles.form, { width }]}>
        <Text accessibilityRole="header" style={[styles.title, { color: c.primary }]}>{t('app_register_title')}</Text>

        <TextField
          label={t('register_name')}
          icon="account-outline"
          value={form.name}
          onChangeText={set('name')}
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          label={t('global_email')}
          icon="email-outline"
          value={form.email}
          onChangeText={set('email')}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          error={errors.email}
        />
        <TextField
          label={t('register_birthday')}
          placeholder={t('app_date_ph')}
          icon="calendar-blank"
          value={form.birthdate}
          onChangeText={set('birthdate')}
          keyboardType="number-pad"
          maxLength={10}
          error={errors.birthdate}
        />
        <TextField
          label={t('global_senha')}
          icon="lock-outline"
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password}
        />
        <TextField
          label={t('register_password_two')}
          icon="lock-outline"
          value={form.password_confirmation}
          onChangeText={set('password_confirmation')}
          secureTextEntry
          autoComplete="new-password"
          error={errors.password_confirmation}
        />

        {formError ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[styles.error, { color: c.danger }]}>{formError}</Text> : null}

        <Button title={t('register_create_btn')} onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={[styles.link, { color: c.textMuted }]}>{t('app_register_has_account')}</Text>
          <Link href="/login" style={[styles.link, { color: c.link }, linkDecoration(c)]}>
            {t('app_register_login')}
          </Link>
        </View>
      </View>
    </View>
  );

  // No tema Orgulho, cada cor envolve o painel com um respiro no topo: as bordas viram faixas.
  const curved = (c.rainbow ?? []).reduceRight<React.ReactNode>(
    (inner, color) => <View style={[styles.band, arc, { backgroundColor: color }]}>{inner}</View>,
    panel,
  );

  return (
    <Screen edges={['top']} backgroundColor={c.brand} contentStyle={styles.content}>
      <StatusBar style={c.brandStatusBar} />
      <View style={styles.header}>
        <LogoMark color={c.onBrand} colors={c.rainbow} height={width * 0.36} />
      </View>

      {curved}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 0, gap: 0 },
  header: { alignItems: 'center', justifyContent: 'center', paddingTop: 24, paddingBottom: 12 },
  curve: { flex: 1, alignSelf: 'center', alignItems: 'center', paddingTop: 56, paddingBottom: 40 },
  band: { flex: 1, alignSelf: 'center', paddingTop: 7 },
  form: { paddingHorizontal: 28, gap: 18 },
  title: { fontSize: 30, fontFamily: fonts.regular, textAlign: 'center', marginBottom: 8 },
  link: { fontSize: 15, fontFamily: fonts.regular },
  error: { textAlign: 'center' },
  footer: { alignItems: 'center', gap: 2, marginTop: 4 },
});
