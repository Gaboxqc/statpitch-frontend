const FALLBACK = '—'

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Formats a number that is already on a 0–100 scale. */
export function formatPercent(value: unknown, decimals = 2): string {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : `${parsed.toFixed(decimals)}%`
}

/** Formats a 0–1 fraction as a percentage. Multiplies first, then rounds. */
export function formatFraction(value: unknown, decimals = 2): string {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : `${(parsed * 100).toFixed(decimals)}%`
}

/** Converts a 0–1 fraction to a 0–100 number, for chart widths and rings. */
export function toPercentValue(value: unknown): number {
  const parsed = toNumber(value)
  return parsed === null ? 0 : Math.round(parsed * 10000) / 100
}

/**
 * Formats a number already on a 0–100 scale, always signed. Used for ROI, where
 * the sign is the whole point and a bare "45.0%" reads as a hit rate.
 */
export function formatSignedPercent(value: unknown, decimals = 2): string {
  const parsed = toNumber(value)
  if (parsed === null) return FALLBACK
  return `${parsed >= 0 ? '+' : ''}${parsed.toFixed(decimals)}%`
}

/**
 * Formats a 0–1 fraction as a signed percentage. EV arrives from the API as a
 * fraction (0.0617 is a +6.17% edge), so it must be multiplied, not suffixed.
 */
export function formatSignedFraction(value: unknown, decimals = 2): string {
  const parsed = toNumber(value)
  if (parsed === null) return FALLBACK
  const scaled = parsed * 100
  return `${scaled >= 0 ? '+' : ''}${scaled.toFixed(decimals)}%`
}

export function formatCount(value: unknown): string {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : String(parsed)
}

export function formatDecimal(value: unknown, decimals = 2): string {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : parsed.toFixed(decimals)
}

/**
 * The publishable part of a model version. The API sends
 * `goals-20260813-bb07c99e`: a family, the date it was fitted, and the commit
 * that fitted it. The commit is what you quote in a bug report, not what a
 * reader needs in a status strip, so it is trimmed here and kept in full in the
 * title attribute wherever this is shown.
 */
export function shortModelVersion(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') return '—'
  return value.split('-').slice(0, 2).join('-')
}
