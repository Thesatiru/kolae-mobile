import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LogoMark } from '@/components/Logo';
import { Text } from '@/components/Text';
import { usePreferences } from '@/preferences/PreferencesProvider';
import { useColors } from '@/theme/useColors';

type Toast = { id: number; title: string; message?: string };
type ToastState = { showToast: (title: string, message?: string) => void };

const VISIBLE_MS = 4000;
const ToastContext = createContext<ToastState | null>(null);

/**
 * Aviso de sucesso com a cara do Kolae (senha trocada, perfil salvo...): desce do topo com o K
 * na cor do tema e some sozinho. Fica na raiz do app, então continua na tela quando a tela que o
 * chamou fecha (ex.: alterar senha volta para a anterior).
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((title: string, message?: string) => {
    setToast({ id: Date.now(), title, message });
    // Leitor de tela: o aviso visual some sozinho, então ele também é falado.
    AccessibilityInfo.announceForAccessibility(message ? `${title}. ${message}` : title);
  }, []);

  const hide = useCallback(() => setToast(null), []);
  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} onHide={hide} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}

function ToastView({ toast, onHide }: { toast: Toast; onHide: () => void }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { motionReduced } = usePreferences();
  // Começa fora da tela (ou já no lugar, com reduzir movimento) e entra deslizando.
  const [progress] = useState(() => new Animated.Value(motionReduced ? 1 : 0));

  useEffect(() => {
    const show = Animated.timing(progress, { toValue: 1, duration: motionReduced ? 0 : 260, useNativeDriver: true });
    show.start();
    const id = setTimeout(() => {
      Animated.timing(progress, { toValue: 0, duration: motionReduced ? 0 : 220, useNativeDriver: true }).start(onHide);
    }, VISIBLE_MS);
    return () => {
      clearTimeout(id);
      show.stop();
    };
  }, [progress, motionReduced, onHide]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] });

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + 8, opacity: progress, transform: [{ translateY }] }]}>
      <Pressable
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        onPress={onHide} // tocar fecha antes do tempo
        style={[
          styles.card,
          { backgroundColor: c.background, borderColor: c.highContrast ? c.text : c.divider },
          c.highContrast && styles.cardContrast,
        ]}>
        <View style={[styles.badge, { backgroundColor: c.brand }]}>
          <LogoMark color={c.onBrand} colors={c.rainbow} height={30} />
        </View>
        <View style={styles.texts}>
          <Text style={[styles.title, { color: c.text }]}>{toast.title}</Text>
          {toast.message ? <Text style={[styles.message, { color: c.textMuted }]}>{toast.message}</Text> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardContrast: { borderWidth: 2 },
  badge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 14, lineHeight: 20 },
});
