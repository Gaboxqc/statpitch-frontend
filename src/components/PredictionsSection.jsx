import MatchCard from './cards/MatchCard.jsx'
import usePredictions from '../hooks/usePredictions.js'

function PredictionsSection() {
  const { predictions, loading, error } = usePredictions()

  if (loading)
    return (
      <div className={'w-full flex flex-col gap-4 mt-12'}>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
        <div className={'h-30 w-11/12 lg:w-8/12 bg-accent mx-auto animate-pulse rounded-sm'}></div>
      </div>
    )
  if (error) return <p>Error: {error.message}</p>
  if (!predictions || predictions.length === 0)
    return <p className={'text-center mt-8'}>No more predictions available.</p>

  return (
    <div className={'mt-12 flex flex-col gap-4 mx-2 lg:w-2/3 lg:mx-auto'}>
      <h3 className={'text-foreground text-lg font-bold ml-2'}>
        <span className={'text-secondary-foreground'}>{predictions.length}</span> Predictions
      </h3>
      {predictions.map((prediction) => {
        return <MatchCard key={prediction.id} prediction={prediction} />
      })}
      <div
        className={
          'flex flex-col gap-4 lg:flex-row lg:justify-between border-t border-secondary-foreground/10 pt-4 text-start mt-8'
        }
      >
        <p className={'text-xs text-secondary-foreground/60'}>
          Model v4 · Gradient Boost + LSTM Ensemble · Updated 21 min ago
        </p>
        <p className={'text-xs text-secondary-foreground/60'}>For informational purposes only.</p>
      </div>
    </div>
  )
}
export default PredictionsSection
