import { useState } from 'react'
import { crestInitials } from '../../utils/crestInitials'

interface TeamCrestProps {
  name: string
  /** Absolute CDN URL, or null — some lower-division sides have no badge anywhere. */
  url: string | null
  className?: string
  /**
   * A list of forty badges, rather than one hero crest. Swaps to the 512-pixel
   * art's ~7 KB sibling: forty native-size badges is about a megabyte for
   * something drawn at 28px.
   */
  dense?: boolean
}

/** The cheap variant lives beside the full-size one, named by its edge. */
const thumbnail = (url: string): string => url.replace('-512.webp', '-128.webp')

/**
 * A club's badge, or its initials when there is no badge to draw.
 *
 * Null is a normal state — some lower-division cup sides have no crest
 * published anywhere — and so is a URL that fails to load, so both land on the
 * same mark rather than on a broken image. The initials are not a placeholder
 * waiting for art: they are drawn as identity, an inset square with a hairline
 * and the initials in full ink.
 *
 * The mark sizes itself from the box rather than from the text around it. It
 * used to be `text-[0.7em]`, which inherited the card's 12px and drew 8px
 * initials inside a 24px square while the same component at 160px needed a
 * hand-passed `text-6xl`. `cqw` makes one rule cover both: the container query
 * unit resolves against this element's own width, so the mark is always 44% of
 * the crest and the call sites stop carrying type sizes.
 */
function TeamCrest({ name, url, className = 'w-7 h-7', dense = false }: TeamCrestProps) {
  const [failed, setFailed] = useState(false)

  if (url && !failed) {
    return (
      <img
        src={dense ? thumbnail(url) : url}
        alt={`${name} crest`}
        // Reserving the box keeps a row from reflowing as badges arrive, and
        // below the fold there is no reason to fetch one at all until it is.
        width={128}
        height={128}
        loading={'lazy'}
        decoding={'async'}
        onError={() => setFailed(true)}
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
