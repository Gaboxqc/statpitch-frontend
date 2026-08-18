import SummaryBar from '../components/predictions/SummaryBar.jsx'
import MatchDayCard from '../components/predictions/MatchDayCard.jsx'
import PredictionsSection from '../components/predictions/PredictionsSection.jsx'
import FiltersBar from '../components/predictions/FiltersBar.jsx'

function HomePage() {
  return (
    <>
      <div>
        <h1 className={'sr-only'}>Today's football predictions</h1>
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
