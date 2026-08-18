import { Navbar } from './components/Navbar.jsx'
import { Outlet } from 'react-router'
import Footer from './components/Footer.jsx'

function Layout() {
  return (
    <>
      <Navbar />
      <main className={'bg-background min-h-screen'}>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
