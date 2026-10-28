import type { VenueDetail } from '@/api/types';

/** Link do Google Maps para a quadra: pelas coordenadas ou, sem elas, pelo endereço. */
export function mapsUrl(venue: Pick<VenueDetail, 'latitude' | 'longitude' | 'address' | 'city'>) {
  const query =
    venue.latitude !== null && venue.longitude !== null
      ? `${venue.latitude},${venue.longitude}`
      : [venue.address, venue.city].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
