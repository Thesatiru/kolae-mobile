export type Coordinates = { latitude: number; longitude: number };

const EARTH_RADIUS_KM = 6371;
const rad = (deg: number) => (deg * Math.PI) / 180;

/** Distância em linha reta (fórmula de haversine), com uma casa decimal como a API. */
export function distanceKm(from: Coordinates, to: Coordinates): number {
  const dLat = rad(to.latitude - from.latitude);
  const dLng = rad(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.sin(dLng / 2) ** 2;
  const km = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  return Math.round(km * 10) / 10;
}

/** Quadra com coordenadas (pode ir para o mapa). Sem elas, aparece só na lista. */
export function hasCoordinates<T extends { latitude: number | null; longitude: number | null }>(
  venue: T,
): venue is T & Coordinates {
  return venue.latitude !== null && venue.longitude !== null;
}
