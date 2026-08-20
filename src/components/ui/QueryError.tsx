import { describeError, isPricingUnavailable } from '../../services/api'

/**
 * The API distinguishes a dead upstream (502) from an exhausted odds quota
 * (503), and the two are not equally bad — the second leaves predictions
 * intact. Saying "we couldn't load this" to both throws that away.
 */
function QueryError({ error, className = '' }: { error: unknown; className?: string }) {
  const degraded = isPricingUnavailable(error)

  return (
    <div
      role={'alert'}
      className={`flex flex-col gap-1 rounded-lg border px-4 py-3 text-center ${
        degraded ? 'border-line bg-secondary' : 'border-negative/40 bg-chart-5/10'
      } ${className}`}
    >
      <p className={'text-sm text-ink'}>
        {degraded ? 'Odds are unavailable right now.' : "We couldn't load this data."}
      </p>
      <p className={'text-xs text-ink-subtle'}>{describeError(error)}</p>
    </div>
  )
}

export default QueryError
