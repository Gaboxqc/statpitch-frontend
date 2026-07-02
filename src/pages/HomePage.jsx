import SummaryBar from '../components/ui/SummaryBar.jsx'
import MatchDayCard from '../components/ui/MatchDayCard.jsx'
import PredictionsSection from '../components/PredictionsSection.jsx'
import FiltersBar from '../components/ui/FiltersBar.jsx'

function HomePage() {
  return (
    <>
      <div>
        <SummaryBar />
        <FiltersBar />
        <div className={'container mx-auto'}>
          <MatchDayCard />
          <PredictionsSection />
        </div>
      </div>
    </>
  )
}
export default HomePage
