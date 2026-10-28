import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader';
import { Screen } from '@/components/Screen';
import { SettingsGroup, SettingsRow, SettingsSection } from '@/components/SettingsList';
import { Text } from '@/components/Text';
import { Logo } from '@/components/Logo';
import { RainbowStripe } from '@/components/Rainbow';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { contrastOutline, palette, THEME_COLORS, type ThemeColor, type ThemeMode } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const TEXT_SIZES = ['app_text_small', 'app_text_default', 'app_text_large', 'app_text_xlarge'];

// Os nomes reaproveitam as chaves dos antigos temas Claro/Escuro/Automático.
const MODES: { mode: ThemeMode; icon: IconName; label: string }[] = [
  { mode: 'light', icon: 'white-balance-sunny', label: 'app_theme_light' },
  { mode: 'dark', icon: 'weather-night', label: 'app_theme_dark' },
  { mode: 'system', icon: 'theme-light-dark', label: 'app_theme_system' },
];

// Miniatura da tela na cor, no modo em uso: cabeçalho com a marca, linhas de texto, card e botão.
function ThemePreview({ color, selected, onPress }: { color: ThemeColor; selected: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useTranslation();
  const { activeScheme } = usePreferences();
  const p = palette[color][activeScheme];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(`app_theme_${color}`)}
      onPress={onPress}
      style={styles.themeOption}>
      <View style={[styles.ring, { borderColor: selected ? c.primary : 'transparent' }]}>
        <View style={[styles.preview, { backgroundColor: p.background, borderColor: p.scheme === 'dark' ? '#3A3F47' : '#D6D8DC' }]}>
          <View style={[styles.previewHeader, { backgroundColor: p.brand, borderBottomColor: p.divider }]}>
            <Logo color={p.onBrand} colors={p.rainbow} size={17} />
            {p.rainbow ? <RainbowStripe colors={p.rainbow} height={4} style={styles.previewStripe} /> : null}
          </View>
          <View style={styles.previewBody}>
            <View style={[styles.line, { backgroundColor: p.surface, width: '75%' }]} />
            <View style={[styles.line, { backgroundColor: p.surface, width: '55%' }]} />
            <View style={[styles.card, { backgroundColor: p.surface }, contrastOutline(p)]} />
            <View style={[styles.previewButton, { backgroundColor: p.primary }]} />
          </View>
        </View>
      </View>
      <View style={styles.radioRow}>
        <MaterialCommunityIcons
          name={selected ? 'check-circle' : 'radiobox-blank'}
          size={22}
          color={selected ? c.primary : c.textMuted}
        />
        <Text style={[styles.optionLabel, { color: c.text, fontWeight: selected ? '700' : '400' }]}>
          {t(`app_theme_${color}`)}
        </Text>
      </View>
    </Pressable>
  );
}

// Slider em degraus: tocar na trilha pula para o degrau mais perto.
type StepSliderProps = { value: number; steps: number; onChange: (v: number) => void; label: string; valueText: string };

function StepSlider({ value, steps, onChange, label, valueText }: StepSliderProps) {
  const c = useColors();
  const [width, setWidth] = useState(0);
  const pct = `${(value / (steps - 1)) * 100}%` as const;
  return (
    <View style={styles.sliderRow}>
      <Text style={[styles.smallA, { color: c.text }]}>A</Text>
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ text: valueText }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          onChange(Math.max(0, Math.min(steps - 1, value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))))
        }
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        onPress={(e) => width && onChange(Math.round((e.nativeEvent.locationX / width) * (steps - 1)))}
        style={styles.track}>
        <View style={[styles.trackLine, { backgroundColor: c.divider }]}>
          <View style={[styles.trackFill, { width: pct, backgroundColor: c.primary }]} />
        </View>
        <View style={[styles.thumb, { left: pct, borderColor: c.primary, backgroundColor: c.background }]} />
      </Pressable>
      <Text style={[styles.bigA, { color: c.text }]}>A</Text>
    </View>
  );
}

// Claro / Escuro / Automático, lado a lado.
function ModeSelector() {
  const c = useColors();
  const { t } = useTranslation();
  const { themeMode, setThemeMode } = usePreferences();
  return (
    <View accessibilityRole="radiogroup" style={[styles.modes, { backgroundColor: c.surface }, contrastOutline(c)]}>
      {MODES.map(({ mode, icon, label }) => {
        const selected = themeMode === mode;
        return (
          <Pressable
            key={mode}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={t(label)}
            onPress={() => setThemeMode(mode)}
            style={[styles.mode, selected && { backgroundColor: c.primary }]}>
            <MaterialCommunityIcons name={icon} size={22} color={selected ? c.onPrimary : c.text} />
            <Text style={[styles.modeText, { color: selected ? c.onPrimary : c.text }]}>{t(label)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// Tudo aqui é real e fica salvo no aparelho.
export default function AppearanceScreen() {
  const { t } = useTranslation();
  const c = useColors();
  const prefs = usePreferences();

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title={t('app_appearance')} />

      <SettingsSection title={t('app_mode')} />
      <ModeSelector />
      {prefs.themeMode === 'system' ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>{t('app_follow_system_desc')}</Text>
      ) : null}

      <SettingsSection title={t('app_color')} />
      <View style={styles.themes} accessibilityRole="radiogroup">
        {THEME_COLORS.map((color) => (
          <ThemePreview
            key={color}
            color={color}
            selected={prefs.themeColor === color}
            onPress={() => prefs.setThemeColor(color)}
          />
        ))}
      </View>

      <SettingsSection title={t('app_accessibility')} />
      <SettingsGroup>
        <SettingsRow label={t('app_text_size')} value={t(TEXT_SIZES[prefs.textSize])}>
          <View style={styles.sliderBox}>
            <StepSlider
              value={prefs.textSize}
              steps={TEXT_SIZES.length}
              onChange={prefs.setTextSize}
              label={t('app_text_size')}
              valueText={t(TEXT_SIZES[prefs.textSize])}
            />
          </View>
        </SettingsRow>
        <SettingsRow
          label={t('app_readable_font')}
          description={t('app_readable_font_desc')}
          switchValue={prefs.readableFont}
          onSwitch={prefs.setReadableFont}
        />
        <SettingsRow
          label={t('app_reduce_motion')}
          description={t('app_reduce_motion_desc')}
          switchValue={prefs.reduceMotion}
          onSwitch={prefs.setReduceMotion}
        />
      </SettingsGroup>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  themes: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '2.5%', rowGap: 16, marginBottom: 8 },
  themeOption: { width: '31.6%', alignItems: 'center', gap: 10 },
  optionLabel: { fontSize: 15, textAlign: 'center', flexShrink: 1 },
  modes: { flexDirection: 'row', borderRadius: 22, padding: 4, gap: 4 },
  mode: { flex: 1, alignItems: 'center', gap: 4, borderRadius: 18, paddingVertical: 10, minHeight: 48 },
  modeText: { fontSize: 14, fontWeight: '600' },
  caption: { fontSize: 14, marginLeft: 16 },
  ring: { alignSelf: 'stretch', borderWidth: 3, borderRadius: 24, padding: 3 },
  preview: { borderWidth: 1, borderRadius: 19, overflow: 'hidden', aspectRatio: 0.63 },
  previewHeader: { height: '29%', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1 },
  previewStripe: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: 0 },
  previewBody: { flex: 1, padding: 10, gap: 6 },
  line: { height: 7, borderRadius: 4 },
  card: { height: '32%', borderRadius: 8, marginTop: 6 },
  previewButton: { height: 18, borderRadius: 9, marginTop: 'auto' },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sliderBox: { paddingHorizontal: 18, paddingBottom: 16 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  smallA: { fontSize: 14, fontWeight: '600' },
  bigA: { fontSize: 26, fontWeight: '600' },
  track: { flex: 1, height: 32, justifyContent: 'center' },
  trackLine: { height: 4, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: 4 },
  thumb: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 3, marginLeft: -13 },
});
