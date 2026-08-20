import { crestInitials } from '../../utils/crestInitials'

interface TeamCrestProps {
  name: string
  /** Currently always null from the API. The element is built to accept one later. */
  url: string | null
  className?: string
}

/**
 * StatPitch supplies no crest, and the old country-flag URLs stopped meaning
 * anything once the domain moved from national teams to clubs. Rendering an
 * <img> against a null source leaves a broken-image box on every card, so the
 * fallback is a real element rather than an empty one.
 */
function TeamCrest({ name, url, className = 'w-6 h-6' }: TeamCrestProps) {
  if (url) {
    return (
      <img src={url} alt={`${name} crest`} className={`${className} object-contain rounded-md`} />
    )
  }

  return (
    <div
      role={'img'}
      aria-label={`${name} crest`}
      className={`${className} shrink-0 flex items-center justify-center rounded-md bg-accent/50 border border-secondary-foreground/15 text-ink-muted font-semibold`}
    >
      <span aria-hidden={true} className={'text-[0.7em] leading-none tracking-tight'}>
        {crestInitials(name)}
      </span>
    </div>
  )
}

export default TeamCrest
