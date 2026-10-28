import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Children, Fragment } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { Text } from '@/components/Text';
import { contrastOutline } from '@/theme/colors';
import { useColors } from '@/theme/useColors';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Título pequeno acima de um grupo ("Notificações", "Sua conta"...).
export function SettingsSection({ title }: { title: string }) {
  const c = useColors();
  return (
    <Text accessibilityRole="header" style={[styles.section, { color: c.textMuted }]}>
      {title}
    </Text>
  );
}

// Bloco cinza arredondado; coloca a linha divisória entre os itens sozinho.
export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={[styles.group, { backgroundColor: c.surface }, contrastOutline(c)]}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 ? <View style={[styles.divider, { backgroundColor: c.divider }]} /> : null}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type RowProps = {
  label: string;
  icon?: IconName;
  description?: string;
  value?: string;
  onPress?: () => void;
  // chevron = abre outra tela; expand = abre/fecha lista na própria tela
  accessory?: 'chevron' | 'expand' | 'none';
  expanded?: boolean;
  bold?: boolean;
  switchValue?: boolean;
  onSwitch?: (value: boolean) => void;
  children?: React.ReactNode; // conteúdo extra abaixo da linha (lista de idiomas, slider)
};

export function SettingsRow({
  label,
  icon,
  description,
  value,
  onPress,
  accessory = onPress ? 'chevron' : 'none',
  expanded,
  bold,
  switchValue,
  onSwitch,
  children,
}: RowProps) {
  const c = useColors();
  const hasSwitch = onSwitch !== undefined;
  const pressable = onPress ?? (hasSwitch ? () => onSwitch(!switchValue) : undefined);

  return (
    <View>
      <Pressable
        accessibilityLabel={[label, description, value].filter(Boolean).join(', ')}
        accessibilityRole={hasSwitch ? 'switch' : onPress ? 'button' : undefined}
        accessibilityState={hasSwitch ? { checked: switchValue } : accessory === 'expand' ? { expanded } : undefined}
        disabled={!pressable}
        onPress={pressable}
        style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
        {icon ? <MaterialCommunityIcons name={icon} size={26} color={c.text} /> : null}
        <View style={styles.texts}>
          <Text style={[styles.label, { color: c.text, fontWeight: bold ? '700' : '400' }]}>{label}</Text>
          {description ? <Text style={[styles.description, { color: c.textMuted }]}>{description}</Text> : null}
        </View>
        {value ? (
          <Text style={[styles.value, { color: c.textMuted }]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {hasSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitch}
            trackColor={{ true: c.primary, false: c.border }}
            thumbColor="#FFFFFF"
            // a linha inteira já é tocável e anuncia o estado
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          />
        ) : null}
        {accessory === 'chevron' ? <MaterialCommunityIcons name="chevron-right" size={24} color={c.textMuted} /> : null}
        {accessory === 'expand' ? (
          <MaterialCommunityIcons name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color={c.textMuted} />
        ) : null}
      </Pressable>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 15, fontWeight: '600', marginTop: 12, marginLeft: 16 },
  group: { borderRadius: 22, overflow: 'hidden' },
  divider: { height: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, paddingVertical: 14, minHeight: 56 },
  texts: { flex: 1, gap: 2 },
  label: { fontSize: 17 },
  description: { fontSize: 14 },
  value: { fontSize: 15, maxWidth: '45%' },
});
