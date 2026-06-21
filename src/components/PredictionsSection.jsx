import MatchCard from './MatchCard.jsx'

function PredictionsSection() {
  return (
    <div className={'m-4 flex flex-col gap-4'}>
      <h3 className={'text-foreground'}>Predictions</h3>
      <MatchCard />
      <MatchCard />
      <MatchCard />
      <MatchCard />
      <MatchCard />
    </div>
  )
}
export default PredictionsSection
