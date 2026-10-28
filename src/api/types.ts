// Tipos do contrato da API v1 (combinado com o backend).
// Sucesso: { data: T } | Erro: { message, errors? } com status HTTP correto.

export type ApiSuccess<T> = { data: T };

export type ApiErrorBody = {
  message: string;
  errors?: Record<string, string[]>; // erros por campo (422)
};

export type UserRole = 'admin' | 'owner' | 'player';

export type User = {
  id: number;
  name: string;
  email: string;
  birthdate: string | null; // ISO 8601: "2004-05-17"
  role: UserRole;
  avatar_url: string | null; // URL completa
  created_at: string; // ISO 8601
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type LoginInput = { email: string; password: string };

export type RegisterInput = {
  name: string;
  email: string;
  birthdate: string; // ISO 8601
  password: string;
  password_confirmation: string;
};

export type ChangePasswordInput = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type Sport = {
  id: number;
  name: string;
  icon: string; // nome do ícone MaterialCommunityIcons (ex.: "soccer")
};

// Calculado pela API conforme o horário; o app só exibe.
export type VenueStatus = 'available' | 'in_use' | 'closed';

export type FloorType = 'grama natural' | 'grama sintetica' | 'cimento' | 'madeira' | 'outro';

// Item de lista (cards da home).
export type VenueSummary = {
  id: number;
  name: string;
  city: string;
  price_per_hour_cents: number | null; // null = gratuito
  rating: number | null; // média 0–5; null = sem avaliações
  ratings_count: number;
  cover_url: string | null;
  sport_ids: number[];
  distance_km: number | null; // só quando o app envia lat/lng
  status: VenueStatus;
  status_until: string | null; // ISO 8601: quando o status muda (fim da partida, fechamento ou abertura)
};

// Detalhe da quadra.
export type VenueDetail = VenueSummary & {
  description: string | null;
  image_urls: string[];
  is_covered: boolean;
  has_lighting: boolean;
  floor_type: FloorType | null;
  court_capacity: number | null;
  // A confirmar com o João: endereço, coordenadas e WhatsApp do dono.
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  owner: { name: string; avatar_url: string | null; member_since: string; whatsapp: string | null };
};

export type VenueFilters = {
  q?: string;
  sport_id?: number;
  sort?: 'distance' | 'rating';
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};
