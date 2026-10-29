import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

import type { Coordinates } from '@/utils/geo';

// Pede a permissão uma vez (o sistema só mostra a pergunta se ainda não foi respondida) e
// guarda a posição por alguns minutos para a home e o detalhe usarem a mesma.
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

/** Posição da pessoa, ou null sem permissão. `ready` = já tentou (para não buscar duas vezes). */
export function useUserPosition() {
  const query = useQuery({ queryKey: ['user-position'], queryFn: readPosition, staleTime: 5 * 60_000 });
  return { position: query.data ?? null, ready: !query.isPending };
}
