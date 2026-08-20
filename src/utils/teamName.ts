/**
 * The kind of club, not which club: "FC", "CF", "RCD", "Calcio". Says nothing
 * about identity, and every name carries some of it.
 */
export const CLUB_NOISE = new Set([
  'fc',
  'cf',
  'afc',
  'cfc',
  'sc',
  'ac',
  'cd',
  'rcd',
  'rc',
  'ud',
  'sd',
  'ss',
  'ssc',
  'as',
  'club',
  'calcio',
])

/**
 * Connectives. Dropped when taking initials, never when shortening a name —
 * "Rayo Vallecano de Madrid" without its "de" is not a club anyone has heard of.
 */
export const CONNECTIVES = new Set(['de', 'del', 'la', 'el', 'the'])

const normalise = (word: string) => word.toLowerCase().replace(/[.']/g, '')

/**
 * The name a reader recognises. Only leading and trailing boilerplate comes off,
 * because the interior of a name is load-bearing:
 *
 *   Club Atlético de Madrid  ->  Atlético de Madrid
 *   Málaga CF                ->  Málaga
 *   RCD Espanyol de Barcelona -> Espanyol de Barcelona
 *   Rayo Vallecano de Madrid ->  unchanged, there is nothing to take off
 *
 * A conservative rule on purpose: the worst case is a name that stays long,
 * rather than one that turns into a different club. The full name stays
 * available for the title attribute and for screen readers.
 */
export function displayName(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  let start = 0
  let end = words.length

  while (start < end && CLUB_NOISE.has(normalise(words[start]))) start += 1
  while (end > start && CLUB_NOISE.has(normalise(words[end - 1]))) end -= 1

  // A name that is nothing but boilerplate is still what the club is called.
  const kept = words.slice(start, end)
  return kept.length > 0 ? kept.join(' ') : name
}
