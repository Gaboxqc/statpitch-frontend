import MatchCard from './MatchCard.jsx'
import usePredictions from '../hooks/usePredictions.js'

function PredictionsSection() {
  const { predictions, loading, error } = usePredictions()

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>
  if (!predictions || predictions.length === 0) return <p>No predictions available.</p>

  return (
    <div className={'m-4 flex flex-col gap-4'}>
      <h3 className={'text-foreground'}>Predictions</h3>
      {console.log(predictions)}
      {predictions.map((prediction) => {
        return (
          <MatchCard
            key={prediction.id}
            home={prediction.home_team}
            away={prediction.away_team}
            home_xg={prediction.home_xg}
            away_xg={prediction.away_xg}
            home_win_prob={prediction.home_win_prob}
            away_win_prob={prediction.away_win_prob}
            draw_prob={prediction.draw_prob}
          />
        )
      })}
    </div>
  )
}
export default PredictionsSection
