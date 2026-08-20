import { CLUB_NOISE, CONNECTIVES } from './teamName'

// Initials drop every kind of boilerplate, including the connectives a display
// name has to keep: "AM" is a better mark for Atlético de Madrid than "AD".
const NOISE = new Set([...CLUB_NOISE, ...CONNECTIVES])

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
