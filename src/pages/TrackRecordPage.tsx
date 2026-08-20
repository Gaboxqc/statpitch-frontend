import { useSearchParams } from 'react-router'
import EquityCurve from '../components/track-record/EquityCurve'
import RoiSummary from '../components/track-record/RoiSummary'
import LedgerTable from '../components/track-record/LedgerTable'
import QueryError from '../components/ui/QueryError'
import { useLedger, useStats } from '../hooks/queries'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { COMPETITIONS } from '../constants/competitions'
import { DISCLAIMER } from '../constants/content'
import type { Basis } from '../types/api'

const PAGE_SIZE = 10
/** The API caps a page at 100, which is also as much curve as is worth drawing. */
const CURVE_SIZE = 100

const isBasis = (value: string | null): value is Basis => value === '1x2' || value === 'overall'

function TrackRecordPage() {
  useDocumentTitle('Track record')

  const [searchParams, setSearchParams] = useSearchParams()
  const basis = isBasis(searchParams.get('basis'))
    ? (searchParams.get('basis') as Basis)
    : undefined
  const competitionId = searchParams.get('competition') ?? undefined
  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0) || 0)

  const update = (next: Record<string, string | null>) => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        for (const [key, value] of Object.entries(next)) {
          if (value) params.set(key, value)
          else params.delete(key)
        }
        return params
      },
      { replace: true },
    )
  }

  const { stats, loading: statsLoading, error: statsError } = useStats()
  // Unfiltered and unpaginated, so the curve shows the whole record rather than
  // whichever slice the table happens to be showing.
  const { bets: curveBets, error: curveError } = useLedger({ limit: CURVE_SIZE })
  const {
    bets,
    total,
    loading: ledgerLoading,
    error: ledgerError,
  } = useLedger({ basis, competition_id: competitionId, offset, limit: PAGE_SIZE })

  return (
    <div className={'measure pt-10 pb-24 flex flex-col gap-12'}>
      <header className={'flex flex-col gap-2'}>
        <h1 className={'text-xl font-semibold text-ink'}>Track record</h1>
        <p className={'text-sm text-ink-muted max-w-2xl'}>
          Every selection below was published before kick-off and settled against a real bookmaker
          price at one unit a bet. Predictions come from the model; the selections, stakes and
          returns are ours.
        </p>
      </header>

      <section className={'flex flex-col gap-4'}>
        <h2 className={'text-sm font-medium text-ink-muted'}>Return on investment</h2>
        {statsError ? (
          <QueryError error={statsError} />
        ) : statsLoading ? (
          <div className={'h-40 bg-accent/20 animate-pulse rounded-lg'} />
        ) : (
          stats && <RoiSummary roi={stats.roi} />
        )}
      </section>

      <section className={'flex flex-col gap-4'}>
        <h2 className={'text-sm font-medium text-ink-muted'}>Cumulative profit and loss</h2>
        {curveError ? <QueryError error={curveError} /> : <EquityCurve bets={curveBets} />}
      </section>

      <section className={'flex flex-col gap-4'}>
        <div className={'flex flex-wrap items-center justify-between gap-4'}>
          <h2 className={'text-sm font-medium text-ink-muted'}>Settled bets</h2>

          <div className={'flex items-center gap-2 text-xs'}>
            <label className={'flex items-center gap-2'}>
              <span className={'sr-only'}>Strategy</span>
              <select
                value={basis ?? ''}
                onChange={(event) => update({ basis: event.target.value || null, offset: null })}
                className={
                  'text-xs bg-accent/60 border border-accent text-ink rounded-md py-1 px-2 cursor-pointer'
                }
              >
                <option value={''}>Both strategies</option>
                <option value={'1x2'}>1X2 only</option>
                <option value={'overall'}>All markets</option>
              </select>
            </label>

            <label className={'flex items-center gap-2'}>
              <span className={'sr-only'}>Competition</span>
              <select
                value={competitionId ?? ''}
                onChange={(event) =>
                  update({ competition: event.target.value || null, offset: null })
                }
                className={
                  'text-xs bg-accent/60 border border-accent text-ink rounded-md py-1 px-2 cursor-pointer'
                }
              >
                <option value={''}>All competitions</option>
                {COMPETITIONS.filter((entry) => entry.priced).map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.short}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {ledgerError ? (
          <QueryError error={ledgerError} />
        ) : ledgerLoading ? (
          <div className={'h-64 bg-accent/20 animate-pulse rounded-lg'} />
        ) : (
          <LedgerTable
            bets={bets}
            total={total}
            offset={offset}
            limit={PAGE_SIZE}
            onOffsetChange={(next) => update({ offset: next === 0 ? null : String(next) })}
          />
        )}
      </section>

      <p className={'text-xs text-ink-subtle border-t border-secondary-foreground/10 pt-4'}>
        {DISCLAIMER.short} {DISCLAIMER.body}
      </p>
    </div>
  )
}

export default TrackRecordPage
