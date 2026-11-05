import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeInLeft, FadeInRight, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { toApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthProvider';
import { isOldEnough, MIN_AGE, PASSWORD_MIN_LENGTH } from '@/auth/rules';
import { Appear } from '@/components/Appear';
import { AuthScaffold, backToLogin } from '@/components/AuthScaffold';
import { Button } from '@/components/Button';
import { Checkbox } from '@/components/Checkbox';
import { DateField, EMPTY_DATE, partsToBr, type DateParts } from '@/components/DateField';
import { Text } from '@/components/Text';
import { FieldError, TextField, type TextFieldRef } from '@/components/TextField';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { linkDecoration } from '@/theme/colors';
import { useColors } from '@/theme/useColors';
import { brDateToIso } from '@/utils/date';
import { openLegal, PRIVACY_URL, TERMS_URL } from '@/utils/legal';
import { errorMessage } from '@/utils/errorMessage';

type Field = 'name' | 'email' | 'birthdate' | 'password' | 'password_confirmation';
type Errors = Partial<Record<Field, string>>;
type Step = 1 | 2;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STEP_FIELDS: Record<Step, Field[]> = { 1: ['name', 'birthdate'], 2: ['email', 'password', 'password_confirmation'] };
const TOTAL_STEPS = 2;

// Barra de progresso das etapas; anda com uma mola ao trocar de etapa.
function StepProgress({ step }: { step: Step }) {
  const c = useColors();
  const { t } = useTranslation();
  const { motionReduced } = usePreferences();
  const progress = useSharedValue(step / TOTAL_STEPS);

  useEffect(() => {
    progress.value = motionReduced ? step / TOTAL_STEPS : withSpring(step / TOTAL_STEPS, { damping: 18 });
  }, [step, motionReduced, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const label = t('app_register_step', { current: step, total: TOTAL_STEPS });

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={styles.progress}>
      <Text style={[styles.progressText, { color: c.textMuted }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: c.surface }]}>
        <Animated.View style={[styles.fill, { backgroundColor: c.primary }, fill]} />
      </View>
    </View>
  );
}

// Regra da senha que marca ✓ conforme a pessoa digita (igual ao alterar senha).
function Rule({ ok, label }: { ok: boolean; label: string }) {
  const c = useColors();
  return (
    <View style={styles.rule}>
      <MaterialCommunityIcons
        name={ok ? 'check-circle' : 'circle-outline'}
        size={18}
        color={ok ? c.primary : c.textMuted}
      />
      <Text style={{ color: ok ? c.text : c.textMuted, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

export default function RegisterScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const { motionReduced } = usePreferences();
  const { signUp } = useAuth();

  // "Próximo" no teclado leva ao campo seguinte.
  const passwordRef = useRef<TextFieldRef>(null);
  const confirmationRef = useRef<TextFieldRef>(null);

  const [step, setStep] = useState<Step>(1);
  const [forward, setForward] = useState(true); // direção da animação entre as etapas
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState<DateParts>(EMPTY_DATE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Como no site: só cria a conta quem aceita os termos e a política (LGPD).
  const [accepted, setAccepted] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);

  const goTo = useCallback((next: Step) => {
    setForward(next > step);
    setStep(next);
  }, [step]);

  // Na etapa 2, o "voltar" do Android volta para a etapa 1 em vez de sair do cadastro.
  useFocusEffect(
    useCallback(() => {
      if (step === 1) return;
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        goTo(1);
        return true;
      });
      return () => sub.remove();
    }, [step, goTo]),
  );

  // Validação local só para retorno rápido; quem decide de verdade é a API (422).
  function validateStep1(): Errors {
    const e: Errors = {};
    if (!name.trim()) e.name = t('app_required');
    const iso = brDateToIso(partsToBr(birthdate));
    if (!birthdate.year) e.birthdate = t('app_required'); // não mexeu na roleta
    else if (!iso) e.birthdate = t('app_invalid_date');
    else if (!isOldEnough(iso)) e.birthdate = t('app_min_age', { count: MIN_AGE });
    return e;
  }

  function validateStep2(): Errors {
    const e: Errors = {};
    if (!EMAIL.test(email.trim())) e.email = t('app_invalid_email');
    if (password.length < PASSWORD_MIN_LENGTH) e.password = t('app_password_min', { count: PASSWORD_MIN_LENGTH });
    if (password !== confirmation) e.password_confirmation = t('app_password_mismatch');
    return e;
  }

  function handleContinue() {
    const local = validateStep1();
    setErrors(local);
    if (Object.keys(local).length) return;
    goTo(2);
  }

  async function handleRegister() {
    const local = validateStep2();
    setErrors(local);
    setFormError(null);
    setTermsError(accepted ? null : t('app_accept_terms_required'));
    if (Object.keys(local).length || !accepted) return;

    setLoading(true);
    try {
      await signUp({
        name: name.trim(),
        email: email.trim(),
        birthdate: brDateToIso(partsToBr(birthdate))!,
        password,
        password_confirmation: confirmation,
      });
    } catch (err) {
      const apiError = toApiError(err);
      const fields: Errors = {};
      (['name', 'email', 'birthdate', 'password', 'password_confirmation'] as Field[]).forEach((f) => {
        const msg = apiError.field(f);
        if (msg) fields[f] = msg;
      });
      setErrors(fields);
      if (!Object.keys(fields).length) setFormError(errorMessage(err));
      // Erro num campo da primeira etapa: volta para ela, onde o erro aparece.
      else if (STEP_FIELDS[1].some((f) => fields[f])) goTo(1);
    } finally {
      setLoading(false);
    }
  }

  const next = { returnKeyType: 'next', submitBehavior: 'submit' } as const;
  const stepAnim = motionReduced ? undefined : (forward ? FadeInRight : FadeInLeft).springify().damping(20);

  return (
    <AuthScaffold
      back={step === 2 ? () => goTo(1) : true}
      title={step === 1 ? t('app_register_title') : t('app_register_access_title')}
      subtitle={step === 1 ? t('app_register_subtitle') : t('app_register_access_subtitle')}
      above={<StepProgress step={step} />}>
      {step === 1 ? (
        <Animated.View key="step1" entering={stepAnim} style={styles.step}>
          <Appear index={0}>
            <TextField
              label={t('register_name')}
              icon="account-outline"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              autoCapitalize="words"
              error={errors.name}
              returnKeyType="done"
            />
          </Appear>
          <Appear index={1}>
            <DateField
              label={t('register_birthday')}
              value={birthdate}
              onChange={setBirthdate}
              error={errors.birthdate}
              hint={t('app_min_age', { count: MIN_AGE })}
              minAge={MIN_AGE}
            />
          </Appear>
          <Appear index={2} style={styles.action}>
            <Button title={t('app_continue')} onPress={handleContinue} />
          </Appear>
        </Animated.View>
      ) : (
        <Animated.View key="step2" entering={stepAnim} style={styles.step}>
          <TextField
            label={t('global_email')}
            placeholder={t('app_email_ph')}
            icon="email-outline"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            error={errors.email}
            {...next}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <TextField
            ref={passwordRef}
            label={t('global_senha')}
            icon="lock-outline"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            revealable
            autoComplete="new-password"
            error={errors.password}
            {...next}
            onSubmitEditing={() => confirmationRef.current?.focus()}
          />
          <TextField
            ref={confirmationRef}
            label={t('register_password_two')}
            icon="lock-check-outline"
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            revealable
            autoComplete="new-password"
            error={errors.password_confirmation}
            returnKeyType="done"
          />

          <View style={styles.rules}>
            <Rule ok={password.length >= PASSWORD_MIN_LENGTH} label={t('app_rule_min', { count: PASSWORD_MIN_LENGTH })} />
            <Rule ok={!!password && password === confirmation} label={t('app_rule_match_register')} />
          </View>

          <View style={styles.terms}>
            <Checkbox
              checked={accepted}
              onChange={(v) => {
                setAccepted(v);
                if (v) setTermsError(null);
              }}
              label={t('register_accept_agree')}
            />
            <View style={styles.termsLinks}>
              <Text
                accessibilityRole="link"
                accessibilityHint={t('app_legal_hint')}
                onPress={() => openLegal(TERMS_URL, c)}
                style={[styles.termsLink, { color: c.link }]}>
                {t('app_terms')}
              </Text>
              <Text style={{ color: c.textMuted }}>·</Text>
              <Text
                accessibilityRole="link"
                accessibilityHint={t('app_legal_hint')}
                onPress={() => openLegal(PRIVACY_URL, c)}
                style={[styles.termsLink, { color: c.link }]}>
                {t('app_privacy_policy')}
              </Text>
            </View>
            <FieldError message={termsError ?? undefined} />
          </View>

          <FieldError message={formError ?? undefined} />

          <View style={styles.action}>
            <Button title={t('register_create_btn')} onPress={handleRegister} loading={loading} />
          </View>
        </Animated.View>
      )}

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: c.textMuted }]}>{t('app_register_has_account')}</Text>
        <Text
          accessibilityRole="link"
          onPress={backToLogin}
          style={[styles.footerLink, { color: c.link }, linkDecoration(c)]}>
          {t('app_register_login')}
        </Text>
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  progress: { gap: 8 },
  progressText: { fontSize: 13, fontWeight: '600' },
  track: { height: 6, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  step: { gap: 16 },
  action: { marginTop: 8 },
  rules: { gap: 6, paddingHorizontal: 2 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spacer: { flexGrow: 1, minHeight: 4 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', columnGap: 6 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '600', paddingVertical: 12 }, // área de toque de 44 px
  terms: { gap: 4, paddingHorizontal: 2 },
  termsLinks: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingLeft: 28 },
  // Links sempre sublinhados: no meio do formulário, a cor sozinha não diz que dá para tocar.
  termsLink: { fontSize: 15, textDecorationLine: 'underline', paddingVertical: 6 },
});
