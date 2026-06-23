import Home from './pages/Home.jsx'
import { Header } from './components/Header.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className={'bg-background'}>
          <Header />
          <Home />
        </div>
      </QueryClientProvider>
    </>
  )
}

export default App
