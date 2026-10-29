import i18n from '@/i18n';

// Números, preços e horas seguem o idioma escolhido no app (pt-br: "R$ 120", "4,8", "21:00";
// en-us: "R$120", "4.8", "9:00 PM"). O preço é sempre em reais: as quadras são no Brasil.
const locale = () => i18n.language;

/** 12000 -> "R$ 120/h"; 0 -> "Grátis"; null -> "Preço não informado" (D31). */
export function formatPricePerHour(cents: number | null): string {
  const price = formatPrice(cents);
  return price ? `${price}${i18n.t('app_per_hour_short')}` : noPriceLabel(cents);
}

/** Texto no lugar do preço: 0 = grátis; null = o dono não informou. */
export function noPriceLabel(cents: number | null): string {
  return i18n.t(cents === 0 ? 'app_free' : 'app_price_unknown');
}

/** 12000 -> "R$ 120"; 0 ou null -> null (use noPriceLabel). Para quando o "/hora" tem estilo próprio. */
export function formatPrice(cents: number | null): string | null {
  if (cents === null || cents === 0) return null;
  const reais = cents / 100;
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'BRL',
    currencyDisplay: 'narrowSymbol', // "R$" em todo idioma, e não "BRL"
    minimumFractionDigits: Number.isInteger(reais) ? 0 : 2,
  };
  try {
    return new Intl.NumberFormat(locale(), options).format(reais);
  } catch {
    // Motor JS sem suporte a narrowSymbol: cai no símbolo padrão do idioma.
    return new Intl.NumberFormat(locale(), { ...options, currencyDisplay: 'symbol' }).format(reais);
  }
}

/** "2026-10-28T21:00:00Z" -> "21:00" no fuso do aparelho. */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
}

/** "08:00" (horário de funcionamento) -> "08:00" (pt-br) / "8:00 AM" (en-us) */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
}

/** 0 -> "domingo" ... 6 -> "sábado", no idioma do app. */
export function formatWeekday(weekday: number): string {
  // 07/01/2024 foi um domingo.
  return new Date(2024, 0, 7 + weekday).toLocaleDateString(locale(), { weekday: 'long' });
}

/** "2026-10-28T..." -> "28 de out. de 2026" (pt-br) / "Oct 28, 2026" (en-us) */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(locale(), { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 4.8 -> "4,8" (pt-br) / "4.8" (en-us) */
export function formatDecimal(value: number): string {
  return new Intl.NumberFormat(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
}

export function formatRating(rating: number | null): string {
  return rating === null ? '–' : formatDecimal(rating);
}

/** Tempo desde a data, curto como nas redes: "agora", "12 min", "3 h", "ontem", "2 dias". */
export function formatAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return i18n.t('app_time_now');
  if (minutes < 60) return i18n.t('app_time_minutes', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return i18n.t('app_time_hours', { count: hours });
  const days = Math.floor(hours / 24);
  return days === 1 ? i18n.t('app_time_yesterday') : i18n.t('app_time_days', { count: days });
}

/** "2025-10-01" -> meses completos até hoje. */
export function monthsSince(isoDate: string): number {
  const from = new Date(isoDate);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - from.getFullYear()) * 12 + now.getMonth() - from.getMonth());
}

/** "Jorge Weckwerth" -> "JW" */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}
