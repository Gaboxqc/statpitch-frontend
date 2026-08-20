import { LogoIcon, MenuIcon } from '../../assets/icons/index'
import { useId, useState } from 'react'
import { Link, NavLink } from 'react-router'

function Navbar() {
  const [isOpened, setIsOpened] = useState(false)
  const menuId = useId()
  const linkBase = 'py-1.5 px-3 rounded-md text-sm'
  const activeClass = 'bg-accent text-ink'
  const inactiveClass = 'text-ink-muted'
  return (
    <header
      className={
        'fixed top-0 right-0 left-0 z-50 bg-background border-b border-secondary-foreground/10'
      }
    >
      <nav className={'measure flex flex-col'}>
        <div className={'flex h-14 text-ink items-center justify-between text-lg'}>
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
                'border border-secondary-foreground/20 rounded-md p-1 bg-secondary-foreground/15 md:hidden'
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
                'bg-primary text-secondary text-sm font-semibold rounded-md py-1.5 px-3 md:block hidden'
              }
            >
              Get started
            </Link>
          </div>
        </div>

        <div
          id={menuId}
          className={`flex-col items-center gap-2 pb-4 text-sm md:hidden ${isOpened ? 'flex' : 'hidden'}`}
        >
          <NavLink
            to={'/'}
            end
            className={({ isActive }) =>
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Home
          </NavLink>
          <NavLink
            to={'/track-record'}
            className={({ isActive }) =>
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Track record
          </NavLink>
          <NavLink
            to={'/pricing'}
            className={({ isActive }) =>
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-accent' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Pricing
          </NavLink>
          <Link
            to={'/login'}
            key={'login'}
            className={
              'bg-primary w-full p-2 rounded-md text-background text-center text-sm font-semibold'
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
