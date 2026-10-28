import { ApiRequestError } from '../errors';
import type { Paginated, Sport, VenueDetail, VenueFilters, VenueSummary } from '../types';
import { delay } from './delay';

// Imagens de exemplo da internet; na API real vêm as fotos cadastradas no site.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

// Horário de hoje (ou de amanhã) em ISO, para o status parecer real em qualquer dia.
function at(hour: number, daysAhead = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const sports: Sport[] = [
  { id: 1, name: 'Futebol', icon: 'soccer' },
  { id: 2, name: 'Basquete', icon: 'basketball' },
  { id: 3, name: 'Vôlei', icon: 'volleyball' },
  { id: 4, name: 'Tênis', icon: 'tennis' },
];

const venues: VenueDetail[] = [
  {
    id: 1,
    name: 'Sesc - São Paulo',
    city: 'São Paulo',
    price_per_hour_cents: null,
    rating: 5,
    ratings_count: 42,
    cover_url: img('sesc-sp'),
    image_urls: [img('sesc-sp'), img('sesc-sp-2')],
    sport_ids: [1, 2, 3],
    distance_km: 12.4,
    description: 'Ginásio coberto com quadra poliesportiva.',
    is_covered: true,
    has_lighting: true,
    floor_type: 'madeira',
    court_capacity: 20,
    status: 'available',
    status_until: at(19),
    address: 'Av. Paulista, 119 · Bela Vista',
    latitude: -23.5703,
    longitude: -46.6448,
    owner: { name: 'Sesc SP', avatar_url: null, member_since: '2025-03-01', whatsapp: null },
  },
  {
    id: 2,
    name: 'Quadra do Xuxa - Suzano',
    city: 'Suzano',
    price_per_hour_cents: 12000,
    rating: 4.8,
    ratings_count: 20,
    cover_url: img('xuxa-suzano'),
    image_urls: [img('xuxa-suzano'), img('xuxa-suzano-2')],
    sport_ids: [1],
    distance_km: 3.1,
    description: 'Quadra de futebol com área de lazer.',
    is_covered: false,
    has_lighting: true,
    floor_type: 'grama sintetica',
    court_capacity: 14,
    status: 'in_use',
    status_until: at(21),
    address: 'Rua das Acácias, 120',
    latitude: -23.5425,
    longitude: -46.3108,
    owner: { name: 'Jorge Weckwerth', avatar_url: null, member_since: '2025-10-01', whatsapp: '5511999990000' },
  },
  {
    id: 3,
    name: 'SESI - Suzano',
    city: 'Suzano',
    price_per_hour_cents: null,
    rating: 5,
    ratings_count: 31,
    cover_url: img('sesi-suzano'),
    image_urls: [img('sesi-suzano')],
    sport_ids: [2, 3],
    distance_km: 4.6,
    description: 'Quadras do SESI abertas à comunidade.',
    is_covered: true,
    has_lighting: true,
    floor_type: 'cimento',
    court_capacity: 12,
    status: 'closed',
    status_until: at(8, 1),
    address: 'Rua Benjamin Constant, 682',
    latitude: -23.5372,
    longitude: -46.3121,
    owner: { name: 'SESI', avatar_url: null, member_since: '2026-01-15', whatsapp: null },
  },
  {
    id: 4,
    name: 'Arena Suzano',
    city: 'Suzano',
    price_per_hour_cents: null,
    rating: 3,
    ratings_count: 8,
    cover_url: img('arena-suzano'),
    image_urls: [img('arena-suzano')],
    sport_ids: [1, 4],
    distance_km: 5.9,
    description: null,
    is_covered: false,
    has_lighting: false,
    floor_type: 'grama natural',
    court_capacity: 22,
    status: 'available',
    status_until: at(22),
    address: 'Av. Mogi das Cruzes, 1500',
    latitude: -23.5480,
    longitude: -46.3000,
    owner: { name: 'Prefeitura de Suzano', avatar_url: null, member_since: '2026-06-10', whatsapp: null },
  },
];

const summary = ({
  description,
  image_urls,
  is_covered,
  has_lighting,
  floor_type,
  court_capacity,
  address,
  latitude,
  longitude,
  owner,
  ...v
}: VenueDetail): VenueSummary => v;

export async function mockListSports(): Promise<Sport[]> {
  await delay(300);
  return sports;
}

export async function mockListVenues(filters: VenueFilters): Promise<Paginated<VenueSummary>> {
  await delay();
  const q = filters.q?.trim().toLowerCase();
  let list = venues.filter(
    (v) => (!q || v.name.toLowerCase().includes(q)) && (!filters.sport_id || v.sport_ids.includes(filters.sport_id)),
  );
  if (filters.sort === 'rating') list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  if (filters.sort === 'distance') list = [...list].sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
  const data = list.map(summary);
  return { data, meta: { current_page: 1, last_page: 1, total: data.length } };
}

export async function mockGetVenue(id: number): Promise<VenueDetail> {
  await delay();
  const venue = venues.find((v) => v.id === id);
  if (!venue) throw new ApiRequestError(404, 'Quadra não encontrada.');
  return venue;
}
