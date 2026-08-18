import { lazy, Suspense } from 'react'
import { isAxiosError } from 'axios'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout'
import HomePage from './pages/HomePage'
import ErrorBoundary from './components/layout/ErrorBoundary'
import RouteFallback from './components/ui/RouteFallback'

// The home route is the landing page, so it stays in the main bundle;
// the others are split out and fetched on demand.
const PricingPage = lazy(() => import('./pages/PricingPage'))
const TrackRecordPage = lazy(() => import('./pages/TrackRecordPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Predictions are published on a slow cadence, so refetching on every focus is wasted work.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Client errors are not worth retrying; only retry transient server/network failures.
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined
        if (status !== undefined && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

// The deploy path lives in vite.config.ts; routes and links stay relative to it.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

const withFallback = (page: React.ReactNode) => (
  <Suspense fallback={<RouteFallback />}>{page}</Suspense>
)

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'track-record', element: withFallback(<TrackRecordPage />) },
        { path: 'pricing', element: withFallback(<PricingPage />) },
      ],
    },
    { path: '/login', element: withFallback(<LoginPage />) },
  ],
  { basename },
)

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
