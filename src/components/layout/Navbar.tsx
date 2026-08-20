import { LogoIcon, MenuIcon } from '../../assets/icons/index'
import { useId, useState } from 'react'
import { Link, NavLink } from 'react-router'

function Navbar() {
  const [isOpened, setIsOpened] = useState(false)
  const menuId = useId()
  const linkBase = 'py-1.5 px-2 rounded-sm text-sm'
  const activeClass = 'bg-accent text-ink'
  const inactiveClass = 'text-ink-muted'
  return (
    <header
      className={'w-full bg-background h-fit py-1 fixed top-0 z-50 left-1/2 -translate-x-1/2'}
    >
      <nav className={'container mx-auto flex flex-col'}>
        <div className={'flex text-ink items-center justify-between mx-2 md:mx-0 text-lg'}>
          <div className={'flex items-center font-semibold gap-2 tracking-tight'}>
            <LogoIcon className={'h-6 w-6 text-primary'} />

            <p>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </div>

          <div className={'hidden md:flex gap-4 items-center'}>
            <NavLink
              to={'/'}
              end
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              Home
            </NavLink>
            <NavLink
              to={'/track-record'}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              Track record
            </NavLink>
            <NavLink
              to={'/pricing'}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              Pricing
            </NavLink>
          </div>

          <div className={'flex gap-4 items-center'}>
            <Link to={'/login'} className={'text-sm text-ink-muted'}>
              Sign in
            </Link>
            <button
              className={
                'border border-secondary-foreground/20 rounded-md p-1 bg-secondary-foreground/15 m-2 md:hidden'
              }
              onClick={() => setIsOpened((prev) => !prev)}
              aria-label={isOpened ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpened}
              aria-controls={menuId}
              type='button'
            >
              <MenuIcon className={'h-6 w-6 text-ink-muted'} />
            </button>
            <Link
              to={'/login'}
              className={
                'bg-primary text-secondary text-sm font-semibold rounded-sm py-1.5 px-2 m-2 md:block hidden'
              }
            >
              Get started
            </Link>
          </div>
        </div>

        <div
          id={menuId}
          className={`flex-col items-center gap-2 mt-4 text-sm md:hidden ${isOpened ? 'flex' : 'hidden'}`}
        >
          <NavLink
            to={'/'}
            end
            className={({ isActive }) =>
              `w-11/12 p-2 rounded-sm ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Home
          </NavLink>
          <NavLink
            to={'/track-record'}
            className={({ isActive }) =>
              `w-11/12 p-2 rounded-sm ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Track record
          </NavLink>
          <NavLink
            to={'/pricing'}
            className={({ isActive }) =>
              `w-11/12 p-2 rounded-sm ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Pricing
          </NavLink>
          <Link
            to={'/login'}
            key={'login'}
            className={
              'bg-primary w-11/12 p-2 rounded-sm text-background text-center text-sm font-semibold'
            }
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
