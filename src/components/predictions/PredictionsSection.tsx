import MatchCard from './MatchCard'
import { useFixtures } from '../../hooks/queries'
import { useElapsed } from '../../hooks/useElapsed'
import QueryError from '../ui/QueryError'
import { COLD_START_HINT_MS } from '../../services/api'
import { DISCLAIMER, MODEL } from '../../constants/content'

function PredictionsSection() {
  const { fixtures: predictions, loading, error } = useFixtures({ day: 'today' })
  const slow = useElapsed(COLD_START_HINT_MS)

  if (loading)
    return (
      <div className={'w-full flex flex-col gap-4 mt-12'}>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
        {slow && (
          <p className={'text-center text-xs text-secondary-foreground/60'} role={'status'}>
            Waking the prediction service. This can take up to a minute.
          </p>
        )}
      </div>
    )
  if (error) return <QueryError error={error} className={'mx-2 mt-12 lg:w-2/3 lg:mx-auto'} />
  if (!predictions || predictions.length === 0)
    return <p className={'text-center mt-8'}>No more predictions available.</p>

  return (
    <div className={'mt-12 flex flex-col gap-4 mx-2 lg:w-2/3 lg:mx-auto'}>
      <h2 className={'text-foreground text-lg font-bold ml-2'}>
        <span className={'text-secondary-foreground'}>{predictions.length}</span> Predictions
      </h2>
      {predictions.map((prediction) => {
        return <MatchCard key={prediction.id} prediction={prediction} />
      })}
      <div
        className={
          'flex flex-col gap-4 lg:flex-row lg:justify-between border-t border-secondary-foreground/10 pt-4 text-start mt-8'
        }
      >
        <p className={'text-xs text-secondary-foreground/60'}>
          Model {predictions[0]?.model_version ?? MODEL.fallbackVersion} · {MODEL.ensemble}
        </p>
        <p className={'text-xs text-secondary-foreground/60'}>{DISCLAIMER.short}</p>
      </div>
    </div>
  )
}
export default PredictionsSection
