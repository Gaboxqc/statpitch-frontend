import { useState } from 'react'
import type { CompetitionGroup } from '../../utils/groupByCompetition'

/**
 * Where one league ends and the next begins.
 *
 * The list used to run as one column of cards with the competition repeated in
 * small type on every card — which said the same thing sixteen times and still
 * never said where the boundary was. Saying it once, as a heading, gives the
 * card its width back.
 *
 * It sticks below the fixed navbar, so the league a fixture belongs to is
 * readable at the point the fixture is, rather than only at the point the
 * scroll happened to start.
 */
function CompetitionHeading({ group }: { group: CompetitionGroup }) {
  const [iconFailed, setIconFailed] = useState(false)

  return (
    <div
      className={
        'sticky top-14 z-10 -mx-1 flex items-center gap-2 border-b border-line bg-background/95 px-1 py-2 backdrop-blur'
      }
    >
      {group.icon !== null && !iconFailed && (
        <img
          src={group.icon}
          alt={''}
          width={128}
          height={128}
          loading={'lazy'}
          decoding={'async'}
          onError={() => setIconFailed(true)}
          className={'h-5 w-5 shrink-0 object-contain'}
        />
      )}
      {/* The full name is the accessible one; the short name is what fits. */}
      <h3 className={'min-w-0 text-sm font-medium text-ink'} title={group.name}>
        {group.short}
      </h3>
      <span className={'numeric shrink-0 text-xs text-ink-subtle'}>{group.fixtures.length}</span>
    </div>
  )
}

export default CompetitionHeading
