import { distanceKm, hasCoordinates } from '@/utils/geo';
import { ApiRequestError } from '../errors';
import type {
  OpeningHours,
  Paginated,
  Schedule,
  ScheduleSlot,
  Sport,
  VenueDetail,
  VenueFilters,
  VenueStatus,
  VenueSummary,
} from '../types';
import { delay } from './delay';

// Faz o papel da API (docs/api.md, "Endpoints da S3"): o status e a agenda saem do horário de
// funcionamento e das partidas abaixo, no relógio do celular. As telas continuam só exibindo.

// Imagens de exemplo da internet; na API real vêm as fotos cadastradas no site.
const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/600`;

export const sports: Sport[] = [
  { id: 1, name: 'Futebol', description: null, icon_path: 'fa-futbol' },
  { id: 2, name: 'Basquete', description: null, icon_path: 'fa-basketball' },
  { id: 3, name: 'Vôlei', description: null, icon_path: 'fa-volleyball' },
  // O Font Awesome não tem ícone de tênis: o app mostra o ícone padrão.
  { id: 4, name: 'Tênis', description: null, icon_path: null },
];

const sport = (id: number) => {
  const { description: _description, ...s } = sports.find((x) => x.id === id)!;
  return s;
};

const everyDay = (opens_at: string, closes_at: string): OpeningHours[] =>
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens_at, closes_at }));

type MockVenue = Omit<VenueDetail, 'status' | 'status_until' | 'cover_image_url'> & {
  closedByOwner?: boolean;
  // Partidas de todo dia, em "HH:MM". "now" = hoje, da hora cheia atual até 2 horas depois,
  // para sempre haver uma quadra em uso enquanto ela está aberta.
  matches: ({ start: string; end: string } | 'now')[];
};

const venues: MockVenue[] = [
  {
    id: 1,
    name: 'Sesc - São Paulo',
    price_per_hour_cents: 0,
    floor_type: 'wood',
    is_covered: true,
    has_lighting: true,
    has_leisure_area: true,
    court_capacity: 20,
    leisure_area_capacity: 60,
    sports: [sport(1), sport(2), sport(3)],
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    latitude: -23.5703,
    longitude: -46.6448,
    description: 'Ginásio coberto com quadra poliesportiva, vestiário e bebedouros.',
    images: [img('sesc-sp'), img('sesc-sp-2')],
    address: {
      street: 'Av. Paulista',
      number: '119',
      complement: null,
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      cep: '01311-903',
      full: 'Av. Paulista, 119 - Bela Vista, São Paulo - SP',
    },
    opening_hours: everyDay('08:00', '22:00'),
    owner: { name: 'Sesc SP', avatar_url: null, member_since: '2025-03-01T10:00:00-03:00', whatsapp: null },
    matches: [{ start: '19:00', end: '21:00' }],
  },
  {
    id: 2,
    name: 'Quadra do Xuxa - Suzano',
    price_per_hour_cents: 12000,
    floor_type: 'synthetic',
    is_covered: false,
    has_lighting: true,
    has_leisure_area: true,
    court_capacity: 14,
    leisure_area_capacity: 30,
    sports: [sport(1)],
    neighborhood: 'Jardim Imperador',
    city: 'Suzano',
    latitude: -23.5425,
    longitude: -46.3108,
    description: 'Quadra society com grama sintética nova, área de lazer com churrasqueira e estacionamento.',
    images: [img('xuxa-suzano'), img('xuxa-suzano-2')],
    address: {
      street: 'Rua das Acácias',
      number: '120',
      complement: null,
      neighborhood: 'Jardim Imperador',
      city: 'Suzano',
      state: 'SP',
      cep: '08673-000',
      full: 'Rua das Acácias, 120 - Jardim Imperador, Suzano - SP',
    },
    opening_hours: [
      ...[1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opens_at: '08:00', closes_at: '23:00' })),
      { weekday: 0, opens_at: '09:00', closes_at: '18:00' },
    ],
    owner: {
      name: 'Jorge Weckwerth',
      avatar_url: null,
      member_since: '2025-10-01T10:00:00-03:00',
      whatsapp: '5511999990000',
    },
    matches: ['now'],
  },
  {
    id: 3,
    name: 'SESI - Suzano',
    price_per_hour_cents: null,
    floor_type: 'court',
    is_covered: true,
    has_lighting: true,
    has_leisure_area: false,
    court_capacity: 12,
    leisure_area_capacity: null,
    sports: [sport(2), sport(3)],
    neighborhood: 'Centro',
    city: 'Suzano',
    latitude: -23.5372,
    longitude: -46.3121,
    description: null,
    images: [img('sesi-suzano')],
    address: {
      street: 'Rua Benjamin Constant',
      number: '682',
      complement: null,
      neighborhood: 'Centro',
      city: 'Suzano',
      state: 'SP',
      cep: '08674-010',
      full: 'Rua Benjamin Constant, 682 - Centro, Suzano - SP',
    },
    opening_hours: everyDay('07:00', '21:00'),
    owner: { name: 'SESI', avatar_url: null, member_since: '2026-01-15T10:00:00-03:00', whatsapp: '5511988880000' },
    closedByOwner: true, // fechada pelo dono, sem data: status_until null
    matches: [],
  },
  {
    id: 4,
    name: 'Arena Suzano',
    price_per_hour_cents: 8000,
    floor_type: 'grass',
    is_covered: false,
    has_lighting: false,
    has_leisure_area: false,
    court_capacity: 22,
    leisure_area_capacity: null,
    sports: [sport(1), sport(4)],
    neighborhood: 'Vila Amorim',
    city: 'Suzano',
    // Endereço não geolocalizado: aparece na lista, mas não no mapa.
    latitude: null,
    longitude: null,
    description: null,
    images: [],
    address: {
      street: 'Av. Mogi das Cruzes',
      number: '1500',
      complement: 'Fundos',
      neighborhood: 'Vila Amorim',
      city: 'Suzano',
      state: 'SP',
      cep: '08674-000',
      full: 'Av. Mogi das Cruzes, 1500, Fundos - Vila Amorim, Suzano - SP',
    },
    opening_hours: [], // horário não cadastrado: sempre fechada, "Horário não informado"
    owner: { name: 'Prefeitura de Suzano', avatar_url: null, member_since: '2026-06-10T10:00:00-03:00', whatsapp: null },
    matches: [],
  },
  {
    id: 5,
    name: 'Arena Ferraz',
    price_per_hour_cents: 9000,
    floor_type: 'sand',
    is_covered: false,
    has_lighting: true,
    has_leisure_area: false,
    court_capacity: 8,
    leisure_area_capacity: null,
    sports: [sport(3)],
    neighborhood: 'Centro',
    city: 'Ferraz de Vasconcelos',
    latitude: -23.5428,
    longitude: -46.3686,
    description: 'Duas quadras de areia para vôlei e futevôlei.',
    images: [img('arena-ferraz')],
    address: {
      street: 'Rua Exemplo',
      number: '100',
      complement: null,
      neighborhood: 'Centro',
      city: 'Ferraz de Vasconcelos',
      state: 'SP',
      cep: '08500-000',
      full: 'Rua Exemplo, 100 - Centro, Ferraz de Vasconcelos - SP',
    },
    // Não abre aos domingos: a agenda de domingo vem vazia ("Fechada neste dia").
    opening_hours: [
      ...[1, 2, 3, 4, 5].map((weekday) => ({ weekday, opens_at: '17:00', closes_at: '23:00' })),
      { weekday: 6, opens_at: '08:00', closes_at: '18:00' },
    ],
    owner: { name: 'Carla Mendes', avatar_url: null, member_since: '2026-05-22T14:57:07-03:00', whatsapp: '5511977770000' },
    matches: [
      { start: '18:00', end: '19:00' },
      { start: '19:00', end: '20:30' }, // em sequência com a anterior: vira uma faixa só
    ],
  },
];

// ---- Datas no fuso do celular, no formato do contrato ----

const pad = (n: number) => String(n).padStart(2, '0');

function toIso(d: Date) {
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  return (
    `${dateKey(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

const dateKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** "2026-11-03" + "19:00" -> Date local */
function at(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
}

function hoursOn(venue: MockVenue, day: Date) {
  if (venue.closedByOwner) return null;
  return venue.opening_hours.find((o) => o.weekday === day.getDay()) ?? null;
}

/** Partidas do dia dentro do horário, em ordem, com as que se encostam juntas. */
function matchesOn(venue: MockVenue, day: Date, open: Date, close: Date) {
  const now = new Date();
  const isToday = dateKey(day) === dateKey(now);
  const hourNow = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
  const ranges = venue.matches
    .filter((m) => m !== 'now' || isToday)
    .map((m) =>
      m === 'now'
        ? { start: hourNow, end: new Date(hourNow.getTime() + 2 * 3_600_000) }
        : { start: at(day, m.start), end: at(day, m.end) },
    )
    .map((m) => ({ start: m.start < open ? open : m.start, end: m.end > close ? close : m.end }))
    .filter((m) => m.start < m.end)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const merged: typeof ranges = [];
  for (const m of ranges) {
    const last = merged[merged.length - 1];
    if (last && m.start <= last.end) last.end = m.end > last.end ? m.end : last.end;
    else merged.push({ ...m });
  }
  return merged;
}

function scheduleFor(venue: MockVenue, day: Date): Schedule {
  const hours = hoursOn(venue, day);
  if (!hours) return { date: dateKey(day), opens_at: null, closes_at: null, slots: [] };

  const open = at(day, hours.opens_at);
  const close = at(day, hours.closes_at);
  const slots: ScheduleSlot[] = [];
  let cursor = open;
  for (const m of matchesOn(venue, day, open, close)) {
    if (cursor < m.start) slots.push({ start: toIso(cursor), end: toIso(m.start), status: 'available' });
    slots.push({ start: toIso(m.start), end: toIso(m.end), status: 'in_use' });
    cursor = m.end;
  }
  if (cursor < close) slots.push({ start: toIso(cursor), end: toIso(close), status: 'available' });
  return { date: dateKey(day), opens_at: hours.opens_at, closes_at: hours.closes_at, slots };
}

/** Mesma regra da API: status agora e quando ele muda (null = sem abertura nos próximos 7 dias). */
function statusNow(venue: MockVenue): { status: VenueStatus; status_until: string | null } {
  const now = new Date();
  const slot = scheduleFor(venue, now).slots.find((s) => new Date(s.start) <= now && now < new Date(s.end));
  if (slot) return { status: slot.status, status_until: slot.end };

  for (let i = 0; i <= 7; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const hours = hoursOn(venue, day);
    if (hours && at(day, hours.opens_at) > now) {
      return { status: 'closed', status_until: toIso(at(day, hours.opens_at)) };
    }
  }
  return { status: 'closed', status_until: null };
}

function toDetail(mock: MockVenue): VenueDetail {
  const { closedByOwner: _closed, matches: _matches, ...venue } = mock;
  return { ...venue, ...statusNow(mock), cover_image_url: venue.images[0] ?? null };
}

function toSummary(venue: MockVenue, position: { lat: number; lng: number } | null): VenueSummary {
  const {
    description: _description,
    leisure_area_capacity: _leisure,
    images: _images,
    address: _address,
    opening_hours: _hours,
    owner: _owner,
    ...summary
  } = toDetail(venue);
  const distance =
    position && hasCoordinates(venue)
      ? distanceKm({ latitude: position.lat, longitude: position.lng }, venue)
      : null;
  return { ...summary, distance_km: distance };
}

function findVenue(id: number) {
  const venue = venues.find((v) => v.id === id);
  if (!venue) throw new ApiRequestError(404, 'NOT_FOUND', 'Quadra não encontrada.');
  return venue;
}

function validationError(errors: Record<string, string[]>) {
  if (Object.keys(errors).length) {
    throw new ApiRequestError(422, 'VALIDATION_ERROR', 'Verifique os campos informados.', errors);
  }
}

// ---- Endpoints ----

export async function mockListSports(): Promise<Sport[]> {
  await delay(300);
  return sports;
}

export async function mockListVenues(filters: VenueFilters): Promise<Paginated<VenueSummary>> {
  await delay();
  const { lat, lng, radius_km, sort = 'name', page = 1, per_page = 20 } = filters;
  const position = lat !== undefined && lng !== undefined ? { lat, lng } : null;

  const errors: Record<string, string[]> = {};
  if ((lat === undefined) !== (lng === undefined)) errors.lat = ['Envie lat e lng juntos.'];
  if (radius_km !== undefined && !position) errors.radius_km = ['O raio exige lat e lng.'];
  else if (radius_km !== undefined && (radius_km < 1 || radius_km > 50)) errors.radius_km = ['Use um raio de 1 a 50 km.'];
  if (sort === 'distance' && !position) errors.sort = ['Ordenar por distância exige lat e lng.'];
  if (per_page < 1 || per_page > 100) errors.per_page = ['Use de 1 a 100 itens por página.'];
  if (page < 1) errors.page = ['A página começa em 1.'];
  validationError(errors);

  const q = filters.q?.trim().toLowerCase();
  let list = venues
    .map((v) => toSummary(v, position))
    .filter(
      (v) =>
        (!q || [v.name, v.neighborhood ?? '', v.city].some((text) => text.toLowerCase().includes(q))) &&
        (filters.sport_id === undefined || v.sports.some((s) => s.id === filters.sport_id)) &&
        (filters.status === undefined || v.status === filters.status) &&
        (filters.max_price_cents === undefined ||
          (v.price_per_hour_cents !== null && v.price_per_hour_cents <= filters.max_price_cents)) &&
        (filters.is_covered === undefined || v.is_covered === filters.is_covered) &&
        (filters.has_lighting === undefined || v.has_lighting === filters.has_lighting) &&
        (filters.has_leisure_area === undefined || v.has_leisure_area === filters.has_leisure_area) &&
        (filters.floor_type === undefined || v.floor_type === filters.floor_type) &&
        (radius_km === undefined || (v.distance_km !== null && v.distance_km <= radius_km)),
    );

  // Sem preço (null) ou sem coordenadas vão para o fim.
  const last = (n: number | null) => n ?? Number.POSITIVE_INFINITY;
  if (sort === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  if (sort === 'price') list = list.sort((a, b) => last(a.price_per_hour_cents) - last(b.price_per_hour_cents));
  if (sort === 'distance') list = list.sort((a, b) => last(a.distance_km) - last(b.distance_km));

  const total = list.length;
  const data = list.slice((page - 1) * per_page, page * per_page);
  return { data, meta: { current_page: page, last_page: Math.max(1, Math.ceil(total / per_page)), per_page, total } };
}

export async function mockGetVenue(id: number): Promise<VenueDetail> {
  await delay();
  return toDetail(findVenue(id));
}

export async function mockGetSchedule(id: number, date?: string): Promise<Schedule> {
  await delay();
  const venue = findVenue(id);
  let day = new Date();
  if (date !== undefined) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const parsed = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
    if (!parsed || dateKey(parsed) !== date) validationError({ date: ['Informe a data no formato AAAA-MM-DD.'] });
    day = parsed!;
  }
  return scheduleFor(venue, day);
}
