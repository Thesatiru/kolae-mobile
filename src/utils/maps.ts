import type { VenueDetail } from '@/api/types';
import { hasCoordinates } from './geo';

/** Link do Google Maps para a quadra: pelas coordenadas ou, sem elas, pelo endereço. */
export function mapsUrl(venue: Pick<VenueDetail, 'latitude' | 'longitude' | 'address'>) {
  const query = hasCoordinates(venue) ? `${venue.latitude},${venue.longitude}` : venue.address.full;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
