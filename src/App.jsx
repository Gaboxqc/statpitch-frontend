import HomePage from './pages/HomePage.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Layout from './Layout.jsx'
import PricingPage from './pages/PricingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/statpitch',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'pricing', element: <PricingPage /> },
    ],
  },
  {
    path: '/statpitch/login',
    element: <LoginPage />,
  },
])

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </>
  )
}

export default App
