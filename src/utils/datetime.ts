// One locale for the whole app, matching <html lang>. Times render in the
// viewer's own timezone, so no fixed offset is ever claimed in the copy.
const LOCALE = 'en-GB'

function toDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Kick-off time only, e.g. "20:00". */
export function formatMatchTime(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date)
}

/** Kick-off with day and the viewer's real timezone, e.g. "Tue 18 Aug, 20:00 CEST". */
export function formatMatchDateTime(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return '—'
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

/** Machine-readable value for <time dateTime>. */
export function toISOString(value: string | null | undefined): string | undefined {
  return toDate(value)?.toISOString() ?? undefined
}
