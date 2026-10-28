import { api, USE_MOCK } from './client';
import { mockGetVenue, mockListSports, mockListVenues } from './mocks/venues.mock';
import type { ApiSuccess, Paginated, Sport, VenueDetail, VenueFilters, VenueSummary } from './types';

export async function listSports(): Promise<Sport[]> {
  if (USE_MOCK) return mockListSports();
  const res = await api.get<ApiSuccess<Sport[]>>('/sports');
  return res.data.data;
}

export async function listVenues(filters: VenueFilters = {}): Promise<Paginated<VenueSummary>> {
  if (USE_MOCK) return mockListVenues(filters);
  const res = await api.get<Paginated<VenueSummary>>('/venues', { params: filters });
  return res.data;
}

export async function getVenue(id: number): Promise<VenueDetail> {
  if (USE_MOCK) return mockGetVenue(id);
  const res = await api.get<ApiSuccess<VenueDetail>>(`/venues/${id}`);
  return res.data.data;
}
