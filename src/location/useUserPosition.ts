import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { usePreferences } from '@/preferences/PreferencesProvider';
import type { Coordinates } from '@/utils/geo';

const QUERY_KEY = ['user-position'];

// Pede a permissão uma vez (o sistema só mostra a pergunta se ainda não foi respondida) e
// guarda a posição por alguns minutos para a home, o mapa e o detalhe usarem a mesma.
async function readPosition(): Promise<Coordinates | null> {
  try {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return null;
    const position =
      (await Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 })) ??
      (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  } catch {
    return null; // GPS desligado ou sem sinal: o app segue sem distância
  }
}

/**
 * Posição da pessoa, ou null com "Usar minha localização" desligado ou sem permissão.
 * `ready` = já se sabe se há posição (para não buscar as quadras duas vezes).
 */
export function useUserPosition() {
  const { useLocation, ready: prefsReady } = usePreferences();
  const enabled = prefsReady && useLocation;
  const query = useQuery({ queryKey: QUERY_KEY, queryFn: readPosition, staleTime: 5 * 60_000, enabled });
  // refresh: lê de novo (ex.: botão "minha localização"); pergunta a permissão outra vez se precisar.
  const refresh = async () => (enabled ? ((await query.refetch()).data ?? null) : null);
  return {
    position: enabled ? (query.data ?? null) : null,
    ready: prefsReady && (!useLocation || !query.isPending),
    enabled: useLocation,
    refresh,
  };
}

/** Liga "Usar minha localização": pede a permissão e, se estiver bloqueada, oferece abrir os ajustes. */
export function useEnableLocation() {
  const { t } = useTranslation();
  const { setUseLocation } = usePreferences();
  const queryClient = useQueryClient();

  return async function enable(): Promise<boolean> {
    const { granted, canAskAgain } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      // Negada de vez: o sistema não pergunta mais, só os ajustes do celular liberam.
      if (!canAskAgain) {
        Alert.alert(t('app_location_denied_title'), t('app_location_denied_text'), [
          { text: t('app_cancel'), style: 'cancel' },
          { text: t('app_open_settings'), onPress: () => void Linking.openSettings() },
        ]);
      }
      return false;
    }
    setUseLocation(true);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    return true;
  };
}
