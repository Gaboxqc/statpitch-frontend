import SummaryBar from '../components/predictions/SummaryBar'
import MatchDayCard from '../components/predictions/MatchDayCard'
import PredictionsSection from '../components/predictions/PredictionsSection'
import FiltersBar from '../components/predictions/FiltersBar'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function HomePage() {
  useDocumentTitle('ML-powered football predictions')

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
