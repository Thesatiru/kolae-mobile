import { useState } from 'react';
import { RefreshControl } from 'react-native';

import { useColors } from '@/theme/useColors';

/**
 * "Puxar para atualizar": devolve o RefreshControl para o `refreshControl` de uma ScrollView,
 * FlatList ou <Screen>. A roda só gira no puxão (não nas atualizações automáticas do
 * refetchInterval, que não devem mexer na tela).
 */
export function usePullToRefresh(refresh: () => Promise<unknown>) {
  const c = useColors();
  const [refreshing, setRefreshing] = useState(false);

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[c.primary]} // Android
      progressBackgroundColor={c.background}
      tintColor={c.primary} // iOS
    />
  );
}
