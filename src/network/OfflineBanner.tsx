import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

const SHOW_AFTER_MS = 1000; // queda rápida (troca de Wi-Fi para 4G) não pisca a faixa

function useOnline() {
  return useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () => onlineManager.isOnline());
}

/**
 * Faixa discreta no topo enquanto não há internet. Some sozinha quando a conexão volta (e o
 * TanStack Query recarrega as telas, ver network/online.ts).
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const online = useOnline();
  const [visible, setVisible] = useState(false);

  // Offline: mostra depois de um instante. Online de novo: esconde e o leitor de tela avisa
  // (a faixa some em silêncio). O timeout tira o setState de dentro do efeito.
  useEffect(() => {
    if (!online) {
      const id = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
      return () => clearTimeout(id);
    }
    if (!visible) return;
    const id = setTimeout(() => {
      setVisible(false);
      AccessibilityInfo.announceForAccessibility(t('app_online_back'));
    }, 0);
    return () => clearTimeout(id);
  }, [online, visible, t]);

  return visible ? <Strip /> : null;
}

function Strip() {
  const c = useColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { motionReduced } = usePreferences();
  const [opacity] = useState(() => new Animated.Value(motionReduced ? 1 : 0));

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: motionReduced ? 0 : 200, useNativeDriver: true }).start();
  }, [opacity, motionReduced]);

  // Cores invertidas do tema (texto sobre fundo de texto): contraste alto em todos os temas.
  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { top: insets.top + 6, opacity }]}>
      <View
        accessible
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.strip, { backgroundColor: c.text }]}>
        <MaterialCommunityIcons
          name="wifi-off"
          size={16}
          color={c.background}
          accessibilityElementsHidden
          importantForAccessibility="no"
        />
        <Text style={[styles.text, { color: c.background }]}>{t('app_offline_banner')}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    opacity: 0.94,
  },
  text: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
});
