import MatchCard from './MatchCard.jsx'
import usePredictions from '../hooks/usePredictions.js'

function PredictionsSection() {
  const { predictions, loading, error } = usePredictions()

  if (loading)
    return (
      <div>
        <div className={'h-30 w-90 bg-accent mx-auto my-4 animate-pulse'}></div>
        <div className={'h-30 w-90 bg-accent mx-auto my-4 animate-pulse'}></div>
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
    </div>
  )
}
export default PredictionsSection
