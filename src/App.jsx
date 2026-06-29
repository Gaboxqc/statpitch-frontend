import Home from './pages/Home.jsx'
import { Navbar } from './components/Navbar.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <div className={'bg-background'}>
          <Navbar />
          <Home />
        </div>
      </QueryClientProvider>
    </>
  )
}

export default App
