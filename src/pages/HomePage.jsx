import SummaryBar from '../components/bars/SummaryBar.jsx'
import MatchDayCard from '../components/cards/MatchDayCard.jsx'
import PredictionsSection from '../components/PredictionsSection.jsx'
import FiltersBar from '../components/bars/FiltersBar.jsx'

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
