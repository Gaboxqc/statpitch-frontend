const FALLBACK = '—'

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Formats a number that is already on a 0–100 scale. */
export function formatPercent(value, decimals = 2) {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : `${parsed.toFixed(decimals)}%`
}

/** Formats a 0–1 fraction as a percentage. Multiplies first, then rounds. */
export function formatFraction(value, decimals = 2) {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : `${(parsed * 100).toFixed(decimals)}%`
}

/** Converts a 0–1 fraction to a 0–100 number, for chart widths and rings. */
export function toPercentValue(value) {
  const parsed = toNumber(value)
  return parsed === null ? 0 : Math.round(parsed * 10000) / 100
}

export function formatCount(value) {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : String(parsed)
}

export function formatDecimal(value, decimals = 2) {
  const parsed = toNumber(value)
  return parsed === null ? FALLBACK : parsed.toFixed(decimals)
}
