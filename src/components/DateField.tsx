import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/Text';
import { FieldError, fieldBoxStyle } from '@/components/TextField';
import { WHEEL_VISIBLE, WheelPicker, useWheelItemHeight } from '@/components/WheelPicker';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';
import { brDateToIso } from '@/utils/date';

export type DateParts = { day: string; month: string; year: string };
export const EMPTY_DATE: DateParts = { day: '', month: '', year: '' };

/** { day: '5', month: '3', year: '2004' } -> "05/03/2004" (formato do brDateToIso). */
export function partsToBr({ day, month, year }: DateParts): string {
  const pad = (v: string) => v.padStart(2, '0');
  return `${pad(day)}/${pad(month)}/${year}`;
}

const daysIn = (month: number, year: number) => new Date(year, month, 0).getDate(); // month 1..12

type Props = {
  label: string;
  value: DateParts;
  onChange: (value: DateParts) => void;
  error?: string;
  hint?: string;
  maxAge?: number; // ano mais antigo da roleta (padrão: 100 anos atrás)
  minAge?: number; // ano mais recente da roleta (ex.: 18 no cadastro)
  initialAge?: number; // onde a roleta começa antes da escolha
};

// Data de nascimento em três roletas (Dia | Mês | Ano): arrasta, sem digitar.
// Enquanto a pessoa não mexe, a data fica "sem escolha" (valor vazio, a roleta só sugere);
// ao mexer em qualquer coluna, as três viram a escolha. Escolhida, aparece por extenso embaixo.
export function DateField({ label, value, onChange, error, hint, maxAge = 100, minAge = 0, initialAge = 25 }: Props) {
  const c = useColors();
  const { t, i18n } = useTranslation();
  const { motionReduced } = usePreferences();
  const itemHeight = useWheelItemHeight();

  const thisYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: maxAge - minAge + 1 }, (_, i) => String(thisYear - maxAge + i)),
    [thisYear, maxAge, minAge],
  );
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(2000, i, 1).toLocaleDateString(i18n.language, { month: 'long' }).replace(/^./, (l) => l.toUpperCase()),
      ),
    [i18n.language],
  );

  // Posição atual das roletas (índices). Começa no valor escolhido ou na sugestão.
  const [pos, setPos] = useState(() => {
    const yearIdx = years.indexOf(value.year);
    return {
      day: value.day ? Number(value.day) - 1 : 0,
      month: value.month ? Number(value.month) - 1 : 0,
      year: yearIdx >= 0 ? yearIdx : Math.max(0, years.indexOf(String(thisYear - initialAge))),
    };
  });

  const days = useMemo(
    () => Array.from({ length: daysIn(pos.month + 1, Number(years[pos.year])) }, (_, i) => String(i + 1)),
    [pos.month, pos.year, years],
  );

  function move(part: 'day' | 'month' | 'year', index: number) {
    const next = { ...pos, [part]: index };
    // 31 de março -> fevereiro: o dia desce para o último do mês.
    next.day = Math.min(next.day, daysIn(next.month + 1, Number(years[next.year])) - 1);
    setPos(next);
    onChange({ day: String(next.day + 1), month: String(next.month + 1), year: years[next.year] });
  }

  const chosen = !!value.year;
  const iso = chosen ? brDateToIso(partsToBr(value)) : null;
  const spelled = iso
    ? new Date(`${iso}T12:00:00`).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <View style={styles.wrapper}>
      <Text importantForAccessibility="no" accessibilityElementsHidden style={[styles.label, { color: c.text }]}>
        {label}
      </Text>
      <View style={[styles.wheels, { height: itemHeight * WHEEL_VISIBLE }]}>
        {/* Faixa da linha escolhida, atrás das roletas. */}
        <View
          pointerEvents="none"
          style={[
            styles.band,
            fieldBoxStyle(c, chosen && !error, !!error),
            { top: itemHeight * Math.floor(WHEEL_VISIBLE / 2), height: itemHeight },
          ]}
        />
        <WheelPicker label={`${label}, ${t('app_date_day')}`} items={days} index={pos.day} onChange={(i) => move('day', i)} flex={0.8} />
        <WheelPicker label={`${label}, ${t('app_date_month')}`} items={months} index={pos.month} onChange={(i) => move('month', i)} flex={1.6} />
        <WheelPicker label={`${label}, ${t('app_date_year')}`} items={years} index={pos.year} onChange={(i) => move('year', i)} flex={1.1} />
      </View>
      {error ? (
        <FieldError message={error} />
      ) : spelled ? (
        <Animated.View entering={motionReduced ? undefined : FadeIn.duration(200)} style={styles.spelled}>
          <MaterialCommunityIcons name="check-circle-outline" size={16} color={c.primary} />
          <Text style={[styles.hint, { color: c.text }]}>{spelled}</Text>
        </Animated.View>
      ) : hint ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', gap: 8 },
  label: { fontSize: 14, fontWeight: '600', paddingHorizontal: 2 },
  wheels: { flexDirection: 'row', gap: 4, paddingHorizontal: 8 },
  band: { position: 'absolute', left: 0, right: 0, borderRadius: 14 },
  spelled: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 2 },
  hint: { fontSize: 13, paddingHorizontal: 2 },
});
