import SummaryBar from '../components/SummaryBar.jsx'
import MatchDayCard from '../components/MatchDayCard.jsx'
import PredictionsSection from '../components/PredictionsSection.jsx'
import FiltersBar from '../components/FiltersBar.jsx'
import Footer from '../components/Footer.jsx'

function Home() {
  return (
    <>
      <main className={'bg-background min-h-screen'}>
        <SummaryBar />
        <FiltersBar />
        <div className={'container mx-auto'}>
          <MatchDayCard />
          <PredictionsSection />
        </div>
      </main>
      <Footer />
    </>
  )
}
export default Home
