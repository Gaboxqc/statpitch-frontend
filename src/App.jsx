import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import PricingPage from './pages/PricingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Predictions are published on a slow cadence, so refetching on every focus is wasted work.
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Client errors are not worth retrying; only retry transient server/network failures.
      retry: (failureCount, error) => {
        const status = error?.response?.status
        if (status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
  },
})

// The deploy path lives in vite.config.js; routes and links stay relative to it.
const basename = import.meta.env.BASE_URL.replace(/\/+$/, '') || '/'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'pricing', element: <PricingPage /> },
      ],
    },
    { path: '/login', element: <LoginPage /> },
  ],
  { basename },
)

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

export default App
