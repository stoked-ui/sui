/**
 * Locale-aware formatting helpers for the Stokd UX components.
 *
 * Ported from the platform's shared formatters so @stoked-ui/stokd stays
 * self-contained (no host/app dependency). All functions are pure and rely
 * only on the standard Intl APIs.
 */

function normalizeLocale(locale?: string): string | undefined {
  const trimmed = locale?.trim();
  return trimmed ? trimmed : undefined;
}

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function replaceYearPart(parts: Intl.DateTimeFormatPart[], year: number): string {
  return parts.map((part) => (part.type === 'year' ? String(year) : part.value)).join('');
}

export function formatDateTime(
  value: string | number | Date | null | undefined,
  locale?: string,
): string {
  const date = toDate(value);
  if (!date) return '-';

  const formatter = new Intl.DateTimeFormat(normalizeLocale(locale), {
    dateStyle: 'short',
    timeStyle: 'short',
  });
  return replaceYearPart(formatter.formatToParts(date), date.getFullYear());
}

export function formatNumber(
  value: number,
  locale?: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(normalizeLocale(locale), options).format(value);
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale?: string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  },
): string {
  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: 'currency',
    currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  }).format(amount);
}

function formatDurationUnit(
  value: number,
  unit: Intl.NumberFormatOptions['unit'],
  locale?: string,
): string {
  return new Intl.NumberFormat(normalizeLocale(locale), {
    style: 'unit',
    unit,
    unitDisplay: 'short',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDuration(
  value: string | number | null | undefined,
  locale?: string,
): string {
  if (value == null) return '-';

  const ms = typeof value === 'string' ? Date.now() - new Date(value).getTime() : value;

  if (!Number.isFinite(ms) || ms < 0) {
    return formatDurationUnit(0, 'second', locale);
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return formatDurationUnit(seconds, 'second', locale);
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    const remainSeconds = seconds % 60;
    return remainSeconds > 0
      ? `${formatDurationUnit(minutes, 'minute', locale)} ${formatDurationUnit(remainSeconds, 'second', locale)}`
      : formatDurationUnit(minutes, 'minute', locale);
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    const remainMinutes = minutes % 60;
    return remainMinutes > 0
      ? `${formatDurationUnit(hours, 'hour', locale)} ${formatDurationUnit(remainMinutes, 'minute', locale)}`
      : formatDurationUnit(hours, 'hour', locale);
  }

  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0
    ? `${formatDurationUnit(days, 'day', locale)} ${formatDurationUnit(remainHours, 'hour', locale)}`
    : formatDurationUnit(days, 'day', locale);
}
