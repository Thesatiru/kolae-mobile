/** Máscara enquanto digita: "17052004" -> "17/05/2004". */
export function maskDate(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** "17/05/2004" -> "2004-05-17" (ISO, formato do contrato). Retorna null se for inválida. */
export function brDateToIso(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid =
    date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd);
  return valid && date < new Date() ? `${yyyy}-${mm}-${dd}` : null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local no formato da API: "2026-10-28". */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Hoje e os próximos dias, à meia-noite local (seletor de dias da agenda). */
export function nextDays(count: number, from = new Date()): Date[] {
  return Array.from({ length: count }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i));
}

/**
 * Quanto esperar para buscar de novo quando o status vence (D03: muda com o relógio).
 * Entre 30 s e 10 min; sem data, 10 min.
 */
export function msUntilChange(iso: string | null | undefined): number {
  const ms = iso ? new Date(iso).getTime() - Date.now() + 1000 : 10 * 60_000;
  return Math.min(Math.max(ms, 30_000), 10 * 60_000);
}
