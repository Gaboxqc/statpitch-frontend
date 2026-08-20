import { crestInitials } from '../../utils/crestInitials'

interface TeamCrestProps {
  name: string
  /** Currently always null from the API. The element is built to accept one later. */
  url: string | null
  className?: string
}

/**
 * StatPitch supplies no crest, and the old country-flag URLs stopped meaning
 * anything once the domain moved from national teams to clubs. Every club is in
 * that position and will be until crests are hosted, so the initials mark is not
 * a fallback waiting to be replaced — it is the identity, and it is drawn like
 * one: an inset square with a hairline, and the initials in full ink.
 *
 * The mark sizes itself from the box rather than from the text around it. It
 * used to be `text-[0.7em]`, which inherited the card's 12px and drew 8px
 * initials inside a 24px square while the same component at 160px needed a
 * hand-passed `text-6xl`. `cqw` makes one rule cover both: the container query
 * unit resolves against this element's own width, so the mark is always 44% of
 * the crest and the call sites stop carrying type sizes.
 */
function TeamCrest({ name, url, className = 'w-7 h-7' }: TeamCrestProps) {
  if (url) {
    return (
      <img
        src={url}
        alt={`${name} crest`}
        className={`${className} shrink-0 aspect-square object-contain rounded-md`}
      />
    )
  }

  return (
    <div
      role={'img'}
      aria-label={`${name} crest`}
      className={`${className} @container shrink-0 aspect-square flex items-center justify-center rounded-md bg-secondary border border-line`}
    >
      <span
        aria-hidden={true}
        className={'text-[44cqw] leading-none font-semibold tracking-tight text-ink'}
      >
        {crestInitials(name)}
      </span>
    </div>
  )
}

export default TeamCrest
