import { LogoIcon, MenuIcon } from '../../assets/icons/index'
import { useId, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { useAccount, useLogout } from '../../hooks/useAccount'
import { useAdminSession } from '../../hooks/useAdminSession'
import { TIER_LABELS } from '../../constants/tiers'

function Navbar() {
  const [isOpened, setIsOpened] = useState(false)
  const menuId = useId()
  const { account, tier, isSignedIn, loading } = useAccount()
  /**
   * One `/auth/me` per session decides whether the administration entry exists
   * at all. It is asked unconditionally because the alternative is an admin who
   * cannot reach `/admin` without typing it — and the answer for everybody else
   * is a single fast 401 that reads as "no", not as a failure.
   */
  const { isAdmin } = useAdminSession()
  const signOut = useLogout()
  const linkBase = 'py-1.5 text-sm border-b-2 transition-[color,border-color]'
  const activeClass = 'border-primary text-ink'
  const inactiveClass = 'border-transparent text-ink-muted hover:text-ink'
  return (
    <header className={'fixed top-0 right-0 left-0 z-50 bg-background border-b border-line'}>
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
              to={'/bets'}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              Today&apos;s picks
            </NavLink>
            <NavLink
              to={'/track-record'}
              className={({ isActive }) => `${linkBase} ${isActive ? activeClass : inactiveClass}`}
            >
              Track record
            </NavLink>
            {/* Anonymous readers are choosing whether to buy; signed-in ones
                are choosing whether to move up, and Elite has nowhere to move
                up to — so it gets no entry rather than an invitation that
                cannot be accepted. */}
            {!isSignedIn && (
              <NavLink
                to={'/pricing'}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? activeClass : inactiveClass}`
                }
              >
                Pricing
              </NavLink>
            )}
            {isSignedIn && tier !== 'elite' && (
              <NavLink
                to={'/pricing'}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'border-primary text-ink' : 'border-transparent text-primary hover:text-ink'}`
                }
              >
                Upgrade
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to={'/admin'}
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? 'border-chart-3 text-ink' : 'border-transparent text-chart-3 hover:text-ink'}`
                }
              >
                Admin
              </NavLink>
            )}
          </div>

          <div className={'flex gap-4 items-center'}>
            {/* Nothing until the first /me settles: guessing wrong here flashes
                the wrong identity at somebody who is already signed in. */}
            {!loading && !isSignedIn && (
              <Link to={'/login'} className={'text-sm text-ink-muted hover:text-ink'}>
                Sign in
              </Link>
            )}
            {isSignedIn && (
              <NavLink
                to={'/account'}
                title={account?.email}
                className={({ isActive }) =>
                  `hidden md:inline text-sm ${isActive ? 'text-ink' : 'text-ink-muted hover:text-ink'}`
                }
              >
                {TIER_LABELS[tier]}
              </NavLink>
            )}
            <button
              className={'border border-line-strong rounded-md p-1 bg-secondary md:hidden'}
              onClick={() => setIsOpened((prev) => !prev)}
              aria-label={isOpened ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpened}
              aria-controls={menuId}
              type='button'
            >
              <MenuIcon className={'h-6 w-6 text-ink-muted'} />
            </button>
            {!loading &&
              (isSignedIn ? (
                <button
                  type='button'
                  onClick={() => signOut.mutate()}
                  disabled={signOut.isPending}
                  className={
                    'border border-line-strong text-ink-muted hover:text-ink text-sm rounded-md py-1.5 px-3 md:block hidden cursor-pointer disabled:cursor-progress'
                  }
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to={'/login?new=1'}
                  className={
                    'bg-primary text-secondary text-sm font-semibold rounded-md py-1.5 px-3 md:block hidden'
                  }
                >
                  Get started
                </Link>
              ))}
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
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Home
          </NavLink>
          <NavLink
            to={'/bets'}
            className={({ isActive }) =>
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Today&apos;s picks
          </NavLink>
          <NavLink
            to={'/track-record'}
            className={({ isActive }) =>
              `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : 'text-ink-muted'}`
            }
            onClick={() => setIsOpened(false)}
          >
            Track record
          </NavLink>
          {(!isSignedIn || tier !== 'elite') && (
            <NavLink
              to={'/pricing'}
              className={({ isActive }) =>
                `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : isSignedIn ? 'text-primary' : 'text-ink-muted'}`
              }
              onClick={() => setIsOpened(false)}
            >
              {isSignedIn ? 'Upgrade' : 'Pricing'}
            </NavLink>
          )}
          {isSignedIn && (
            <NavLink
              to={'/account'}
              className={({ isActive }) =>
                `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : 'text-ink-muted'}`
              }
              onClick={() => setIsOpened(false)}
            >
              Account
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to={'/admin'}
              className={({ isActive }) =>
                `w-full p-2 rounded-md ${isActive ? 'text-ink bg-secondary' : 'text-chart-3'}`
              }
              onClick={() => setIsOpened(false)}
            >
              Admin
            </NavLink>
          )}
          {!loading &&
            (isSignedIn ? (
              <button
                type='button'
                onClick={() => {
                  setIsOpened(false)
                  signOut.mutate()
                }}
                disabled={signOut.isPending}
                className={
                  'border border-line-strong text-ink-muted w-full p-2 rounded-md text-center text-sm cursor-pointer disabled:cursor-progress'
                }
              >
                Sign out
              </button>
            ) : (
              <Link
                to={'/login?new=1'}
                key={'login'}
                className={
                  'bg-primary w-full p-2 rounded-md text-background text-center text-sm font-semibold'
                }
                onClick={() => setIsOpened(false)}
              >
                Get started free
              </Link>
            ))}
        </div>
      </nav>
    </header>
  )
}

export { Navbar }
