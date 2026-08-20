import { Navbar } from './components/layout/Navbar'
import { Outlet } from 'react-router'
import Footer from './components/layout/Footer'

function Layout() {
  return (
    <>
      <Navbar />
      {/* The header is fixed at h-14; the offset lives here once rather than in
          every page's top padding. */}
      <main className={'bg-background min-h-screen pt-14'}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
