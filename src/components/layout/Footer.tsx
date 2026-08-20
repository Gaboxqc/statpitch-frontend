import { useId, useState } from 'react'
import { Link } from 'react-router'
import { LogoIcon } from '../../assets/icons/index'
import { BRAND, DISCLAIMER } from '../../constants/content'
import { COMPETITIONS } from '../../constants/competitions'

const LINKS = [
  { to: '/', label: 'Predictions' },
  { to: '/track-record', label: 'Track record' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/login', label: 'Sign in' },
]

/**
 * The thinnest surface in the app carried a disclaimer and a copyright line.
 * What belongs here is what is true of the whole product rather than of one
 * fixture — what is covered, and how much of it can produce a bet at all, which
 * was previously stated once, halfway down the pricing page.
 */
function Footer() {
  const [isOpened, setIsOpened] = useState(false)
  const detailId = useId()
  const priced = COMPETITIONS.filter((entry) => entry.priced).length

  return (
    <footer className={'bg-background text-ink mt-24 border-t border-line'}>
      <div className={'measure flex flex-col gap-8 py-10'}>
        <div className={'grid gap-8 sm:grid-cols-2 lg:grid-cols-3'}>
          <div className={'flex flex-col gap-2'}>
            <Link to={'/'} className={'flex w-fit items-center gap-2 font-semibold tracking-tight'}>
              <LogoIcon className={'h-5 w-5 text-primary'} />
              <span>
                Stat<span className={'text-primary'}>Pitch</span>
              </span>
            </Link>
            <p className={'text-xs text-ink-subtle'}>
              Calibrated probabilities for every fixture, priced against the market.
            </p>
          </div>

          <nav className={'flex flex-col gap-2'} aria-label={'Footer'}>
            <p className={'eyebrow text-ink-subtle'}>Product</p>
            <ul className={'flex flex-col gap-1.5 text-xs'}>
              {LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={'text-ink-muted hover:text-ink'}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={'flex flex-col gap-2'}>
            <p className={'eyebrow text-ink-subtle'}>Coverage</p>
            <p className={'text-xs text-ink-muted'}>
              <span className={'numeric text-ink'}>{COMPETITIONS.length}</span> competitions, of
              which <span className={'numeric text-ink'}>{priced}</span> are priced against a
              bookmaker market.
            </p>
            {/* The cups are predicted and never bettable, which is worth saying
                once somewhere permanent rather than only in a select's options. */}
            <p className={'text-xs text-ink-subtle'}>
              A competition with no odds market can produce a prediction, never a selection.
            </p>
          </div>
        </div>

        <div
          className={
            'flex flex-col gap-4 border-t border-line pt-6 text-xs lg:flex-row lg:items-start lg:justify-between'
          }
        >
          <p className={'text-ink-subtle lg:max-w-3xl'}>
            <span className={'text-ink-muted'}>{DISCLAIMER.short}</span> {DISCLAIMER.body}{' '}
            <span id={detailId} hidden={!isOpened}>
              {DISCLAIMER.extended}{' '}
            </span>
            <button
              type='button'
              className={'cursor-pointer text-ink-muted underline'}
              aria-expanded={isOpened}
              aria-controls={detailId}
              onClick={() => setIsOpened((prev) => !prev)}
            >
              {isOpened ? 'Less' : 'Read more'}
            </button>
          </p>
          <p className={'text-ink-subtle lg:shrink-0'}>
            © <span className={'numeric'}>{new Date().getFullYear()}</span> {BRAND}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
