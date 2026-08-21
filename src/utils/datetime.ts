// One locale for the whole app, matching <html lang>. Times render in the
// viewer's own timezone, so no fixed offset is ever claimed in the copy.
const LOCALE = 'en-GB'

const FALLBACK = '—'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const HAS_OFFSET = /(?:Z|[+-]\d{2}:?\d{2})$/

/**
 * The API serialises real UTC instants without a `Z` (`2026-08-19T19:00:00`),
 * and JavaScript reads an offsetless date-time as *local* time. Left alone
 * that silently shows every viewer outside UTC the wrong kick-off, so the
 * suffix is restored before parsing.
 */
function parseInstant(value: string | null | undefined): Date | null {
  if (!value) return null
  const normalised = HAS_OFFSET.test(value) ? value : `${value}Z`
  const date = new Date(normalised)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * `match_date` is a bare calendar date already resolved to the API's timezone.
 * Parsing it with `new Date()` would place it at UTC midnight, which renders as
 * the previous day for any viewer behind UTC — including the API's own
 * America/Managua. Building it from parts keeps the calendar day intact.
 */
function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value || !DATE_ONLY.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Kick-off time only, e.g. "20:00", in the viewer's timezone. */
export function formatMatchTime(value: string | null | undefined): string {
  const date = parseInstant(value)
  if (!date) return FALLBACK
  return new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' }).format(date)
}

/** Kick-off with day and the viewer's real timezone, e.g. "Tue 18 Aug, 20:00 CEST". */
export function formatMatchDateTime(value: string | null | undefined): string {
  const date = parseInstant(value)
  if (!date) return FALLBACK
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(date)
}

/**
 * A date to put in a sentence, e.g. "3 March 2027" — for a subscription
 * expiry, where the day is the whole point and the minute is noise.
 */
export function formatLongDate(value: string | null | undefined): string {
  const date = parseInstant(value)
  if (!date) return FALLBACK
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** A calendar day with no time attached, e.g. "Wed 19 Aug". */
export function formatMatchDay(value: string | null | undefined): string {
  const date = parseDateOnly(value)
  if (!date) return FALLBACK
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

const RELATIVE = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** How long ago the sync ran, e.g. "4 hours ago". */
export function formatRelativeTime(value: string | null | undefined, now = Date.now()): string {
  const date = parseInstant(value)
  if (!date) return FALLBACK
  const elapsed = date.getTime() - now
  for (const [unit, ms] of UNITS) {
    if (Math.abs(elapsed) >= ms) return RELATIVE.format(Math.round(elapsed / ms), unit)
  }
  return RELATIVE.format(0, 'minute')
}

/** Machine-readable value for <time dateTime>. */
export function toISOString(value: string | null | undefined): string | undefined {
  return (parseInstant(value) ?? parseDateOnly(value))?.toISOString() ?? undefined
}

export interface KickoffLabel {
  /** What to render. */
  text: string
  /** Machine-readable value for <time dateTime>, absent when the date is provisional. */
  dateTime?: string
  /** True when the fixture sits on a matchday placeholder rather than a real kick-off. */
  provisional: boolean
}

/**
 * Most fixtures upstream sit on a matchday placeholder rather than a confirmed
 * kick-off. Those must never render as a specific time — `kickoff` and
 * `commence_time` are both null there, and the honest label is the day itself.
 */
export function describeKickoff(fixture: {
  date_confirmed: boolean
  commence_time: string | null
  match_date: string
}): KickoffLabel {
  if (!fixture.date_confirmed || !fixture.commence_time) {
    return {
      text: `${formatMatchDay(fixture.match_date)} · time TBC`,
      provisional: true,
    }
  }
  return {
    text: formatMatchTime(fixture.commence_time),
    dateTime: toISOString(fixture.commence_time),
    provisional: false,
  }
}

/** The long form of {@link describeKickoff}, for the hero card. */
export function describeKickoffLong(fixture: {
  date_confirmed: boolean
  commence_time: string | null
  match_date: string
}): KickoffLabel {
  if (!fixture.date_confirmed || !fixture.commence_time) {
    return {
      text: `${formatMatchDay(fixture.match_date)} · time TBC`,
      provisional: true,
    }
  }
  return {
    text: formatMatchDateTime(fixture.commence_time),
    dateTime: toISOString(fixture.commence_time),
    provisional: false,
  }
}
