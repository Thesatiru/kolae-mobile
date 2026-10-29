import { api, MOCK_VENUES } from './client';
import { mockGetSchedule, mockGetVenue, mockListSports, mockListVenues } from './mocks/venues.mock';
import type { ApiSuccess, Paginated, Schedule, Sport, VenueDetail, VenueFilters, VenueSummary } from './types';

export async function listSports(): Promise<Sport[]> {
  if (MOCK_VENUES) return mockListSports();
  const res = await api.get<ApiSuccess<Sport[]>>('/sports');
  return res.data.data;
}

export async function listVenues(filters: VenueFilters = {}): Promise<Paginated<VenueSummary>> {
  if (MOCK_VENUES) return mockListVenues(filters);
  const res = await api.get<Paginated<VenueSummary>>('/venues', { params: filters });
  return res.data;
}

export async function getVenue(id: number): Promise<VenueDetail> {
  if (MOCK_VENUES) return mockGetVenue(id);
  const res = await api.get<ApiSuccess<VenueDetail>>(`/venues/${id}`);
  return res.data.data;
}

/** Agenda de um dia ("YYYY-MM-DD"); sem data, a API usa hoje (horário de Brasília). */
export async function getSchedule(id: number, date?: string): Promise<Schedule> {
  if (MOCK_VENUES) return mockGetSchedule(id, date);
  const res = await api.get<ApiSuccess<Schedule>>(`/venues/${id}/schedule`, { params: date ? { date } : {} });
  return res.data.data;
}
