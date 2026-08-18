// Club names carry a lot of boilerplate that says nothing about which club it
// is, so it is dropped before initials are taken.
const NOISE = new Set([
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
  'as',
  'club',
  'calcio',
  'de',
  'del',
  'la',
  'el',
  'the',
])

export function crestInitials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean)
  const meaningful = words.filter((word) => !NOISE.has(word.toLowerCase().replace(/[.']/g, '')))
  const source = meaningful.length > 0 ? meaningful : words
  if (source.length === 0) return '?'
  // A single-word name gives a nicer mark as two letters than one.
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase()
  return source
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}
