import SummaryBar from '../components/SummaryBar.jsx'
import MatchDayCard from '../components/MatchDayCard.jsx'
import PredictionsSection from '../components/PredictionsSection.jsx'

function Home() {
  return (
    <main className={'container mx-auto bg-background min-h-screen'}>
      <SummaryBar />
      <MatchDayCard />
      <PredictionsSection />
    </main>
  )
}
export default Home
