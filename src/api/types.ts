// Tipos do contrato da API v1 (docs/api.md no repositório do João).
// Sucesso: { data: T } | Erro: { message, code, errors? } com status HTTP correto.

export type ApiSuccess<T> = { data: T };

export type ApiErrorBody = {
  message: string;
  code: string; // ex.: "VALIDATION_ERROR", "AUTH_TOKEN_EXPIRED"
  errors?: Record<string, string[]>; // lista de mensagens por campo (só no 422)
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
  token_type: 'Bearer';
  expires_at: string; // ISO 8601; o token vale 30 dias, sem renovação (D07)
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

/** Arquivo escolhido no celular para enviar (multipart). */
export type UploadFile = {
  uri: string;
  name: string; // ex.: "avatar.jpg"
  type: string; // ex.: "image/jpeg"
};

export type ChangePasswordInput = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type Sport = {
  id: number;
  name: string;
  description: string | null;
  icon_path: string | null; // classe do Font Awesome (ex.: "fa-futbol"); o app converte em sportIcon()
};

// Calculado pela API conforme o horário; o app só exibe.
export type VenueStatus = 'available' | 'in_use' | 'closed';

// Chaves do banco (D15); o app traduz com app_floor_<chave>.
export type FloorType = 'synthetic' | 'court' | 'sand' | 'clay' | 'grass' | 'wood';

// Esporte dentro da quadra (sem description).
export type VenueSport = Pick<Sport, 'id' | 'name' | 'icon_path'>;

// Resumo da quadra (lista, cards e mapa).
export type VenueSummary = {
  id: number;
  name: string;
  status: VenueStatus;
  status_until: string | null; // ISO 8601: quando o status muda; null = fechada sem data para abrir
  price_per_hour_cents: number | null; // 0 = grátis; null = o dono não informou (D31)
  floor_type: FloorType;
  is_covered: boolean;
  has_lighting: boolean;
  has_leisure_area: boolean; // D32
  court_capacity: number | null;
  cover_image_url: string | null;
  sports: VenueSport[]; // pode vir vazia até o dono marcar (D29)
  neighborhood: string | null;
  city: string;
  latitude: number | null; // null = sem geolocalização: aparece na lista, mas não no mapa
  longitude: number | null;
  distance_km: number | null; // só quando a busca manda lat/lng
};

export type VenueAddress = {
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  full: string; // pronto para exibir ou abrir no app de mapas
};

export type OpeningHours = {
  weekday: number; // 0 = domingo ... 6 = sábado
  opens_at: string; // "08:00"
  closes_at: string; // "22:00"
};

export type VenueOwner = {
  name: string;
  avatar_url: string | null;
  member_since: string; // ISO 8601
  whatsapp: string | null; // só dígitos, com DDI e DDD; null = sem botão "Falar com o dono" (D24)
};

// Detalhe da quadra: o resumo sem distance_km (o app calcula, D33) e mais estes campos.
export type VenueDetail = Omit<VenueSummary, 'distance_km'> & {
  description: string | null; // null = esconder "Sobre a quadra" (D30)
  leisure_area_capacity: number | null;
  images: string[]; // a capa primeiro; vazia se não há foto
  address: VenueAddress;
  opening_hours: OpeningHours[]; // só os dias em que abre; vazia = horário não informado (D23)
  owner: VenueOwner;
};

export type ScheduleSlot = {
  start: string; // ISO 8601
  end: string;
  status: 'available' | 'in_use';
};

// Agenda de um dia. Dia sem funcionamento: opens_at/closes_at null e slots vazio.
export type Schedule = {
  date: string; // "YYYY-MM-DD"
  opens_at: string | null;
  closes_at: string | null;
  slots: ScheduleSlot[];
};

export type VenueSort = 'name' | 'price' | 'distance';

// Parâmetros de GET /venues (todos opcionais).
export type VenueFilters = {
  q?: string;
  sport_id?: number;
  status?: VenueStatus;
  max_price_cents?: number; // inclui as grátis; deixa de fora as sem preço
  is_covered?: boolean;
  has_lighting?: boolean;
  has_leisure_area?: boolean;
  floor_type?: FloorType;
  lat?: number; // lat e lng sempre juntos
  lng?: number;
  radius_km?: number; // 1 a 50; exige lat/lng
  sort?: VenueSort; // padrão "name"; "distance" exige lat/lng
  page?: number;
  per_page?: number; // 1 a 100 (padrão 20)
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
};

export type UpdateMeInput = { name: string }; // só o nome: a data de nascimento não muda (D09)
