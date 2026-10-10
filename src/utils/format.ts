const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brlCompact = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export const formatBRL = (value: number) => brl.format(value);
export const formatBRLInt = (value: number) => brlCompact.format(value);

const EMPTY = '—';

/** Valor monetário vindo da API (number ou string). */
export function formatMoney(value: number | string | null | undefined, currency = 'BRL', compact = false): string {
  if (value == null || value === '') return EMPTY;
  const n = Number(value);
  if (Number.isNaN(n)) return EMPTY;
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'BRL',
      maximumFractionDigits: compact ? 0 : 2,
    }).format(n);
  } catch {
    return brl.format(n);
  }
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Data ISO (yyyy-mm-dd ou UTC) → dd/MM/yyyy. Datas puras não sofrem ajuste de fuso. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY;
  const pure = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (pure) return `${pure[3]}/${pure[2]}/${pure[1]}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** UTC → dd/MM/yyyy HH:mm no fuso do navegador. */
export function formatDateTime(iso: string | null | undefined, sep = ' '): string {
  if (!iso) return EMPTY;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return EMPTY;
  return `${formatDate(iso)}${sep}${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ageFrom(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const b = new Date(iso);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) age--;
  return age;
}

/** Texto vindo da API ou "—". */
export const orDash = (v: string | null | undefined) => (v && v.trim() ? v : EMPTY);
