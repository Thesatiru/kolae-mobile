import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform } from 'react-native';

// O TanStack Query passa a saber quando a internet cai e volta: offline, as consultas esperam
// (em vez de falhar); ao reconectar, ele refaz as das telas abertas (refetchOnReconnect).
// isInternetReachable null = ainda não sabe; só conta como offline quando é false.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false && state.isInternetReachable !== false);
  }),
);

// E quando o app vai para segundo plano: o refetchInterval (status da quadra, polling do chat)
// para enquanto o app não está na tela e volta ao abrir de novo. No navegador o TanStack já
// usa a visibilidade da aba.
if (Platform.OS !== 'web') {
  focusManager.setEventListener((setFocused) => {
    const subscription = AppState.addEventListener('change', (status) => setFocused(status === 'active'));
    return () => subscription.remove();
  });
}
