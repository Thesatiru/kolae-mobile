import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

// O TanStack Query passa a saber quando a internet cai e volta: offline, as consultas esperam
// (em vez de falhar); ao reconectar, ele refaz as das telas abertas (refetchOnReconnect).
// isInternetReachable null = ainda não sabe; só conta como offline quando é false.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false && state.isInternetReachable !== false);
  }),
);
