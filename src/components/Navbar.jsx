import { LogoIcon, MenuIcon } from '../assets/icons/index.js'
import { useState } from 'react'
import { Link, NavLink } from 'react-router'

function Navbar() {
  const [isOpened, setIsOpened] = useState(false)
  return (
    <header
      className={'w-full bg-background h-fit py-1 fixed top-0 z-50 left-1/2 -translate-x-1/2'}
    >
      <nav className={'container mx-auto flex flex-col'}>
        <div className={'flex text-foreground items-center justify-between mx-2 md:mx-0 text-lg'}>
          <div className={'flex items-center font-bold gap-2'}>
            <LogoIcon className={'h-6 w-6 text-primary'} />

            <p>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </div>

          <div className={'hidden md:flex gap-4 items-center'}>
            <NavLink to={'/statpitch'} className={'bg-accent py-1.5 px-2 rounded-sm text-sm'}>
              Home
            </NavLink>
            <NavLink to={'pricing'} className={' p-1.5 rounded-sm text-sm'}>
              Pricing
            </NavLink>
          </div>

          <div className={'flex gap-4 items-center'}>
            <Link to={'login'} className={'text-md text-sm text-secondary-foreground'}>
              Sign in
            </Link>
            <button
              className={
                'border border-secondary-foreground/20 rounded-md p-1 bg-secondary-foreground/15 m-2 md:hidden'
              }
              onClick={() => setIsOpened((prev) => !prev)}
            >
              <MenuIcon className={'h-6 w-6 text-secondary-foreground'} />
            </button>
            <Link
              to={'login'}
              className={
                'bg-primary text-secondary font-bold text-sm rounded-sm py-1.5 px-2 m-2 md:block hidden'
              }
            >
              Get started
            </Link>
          </div>
        </div>

        <div
          className={`flex flex-col items-center gap-2 mt-4 text-sm ${isOpened ? 'block' : 'hidden'}`}
        >
          <NavLink
            to={'/statpitch'}
            key={'/statpitch'}
            className={'text-foreground bg-accent w-11/12 p-2 rounded-sm'}
            onClick={() => setIsOpened(false)}
          >
            Home
          </NavLink>
          <NavLink
            to={'pricing'}
            key={'pricing'}
            className={'text-secondary-foreground w-11/12 p-2 rounded-sm'}
            onClick={() => setIsOpened(false)}
          >
            Pricing
          </NavLink>
          <Link
            to={'login'}
            key={'login'}
            className={'bg-primary w-11/12 p-2 rounded-sm text-background text-center font-bold'}
            onClick={() => setIsOpened(false)}
          >
            Get started free
          </Link>
        </div>
      </nav>
    </header>
  )
}

export { Navbar }
