import { BrainIcon, GithubIcon, GoogleIcon, LogoIcon } from '../assets/icons/index'
import { Link, useSearchParams } from 'react-router'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import LiveRoi from '../components/track-record/LiveRoi'

function LoginPage() {
  // "Get started" and "Sign in" are different intentions and used to land on the
  // same side of this toggle. Which side is open lives in the address rather
  // than in component state, so the two entry points differ, the choice
  // survives a reload, and the URL never disagrees with what is on screen.
  const [searchParams, setSearchParams] = useSearchParams()
  const isNewAccount = searchParams.get('new') === '1'
  const setIsNewAccount = (next: boolean) =>
    setSearchParams(next ? { new: '1' } : {}, { replace: true })
  useDocumentTitle(isNewAccount ? 'Create account' : 'Sign in')
  return (
    <div className={'flex items-center w-full'}>
      <div className={'border-r border-line bg-card min-h-screen w-2/6 hidden lg:block'}>
        <div className={'p-8 flex flex-col justify-between h-full'}>
          <Link
            to={'/'}
            className={'items-center font-semibold gap-2 hidden lg:flex tracking-tight'}
          >
            <LogoIcon className={'h-6 w-6 text-primary'} />
            <p className={'text-xl'}>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </Link>

          <div>
            <p className={'text-xl'}>ML-powered predictions.</p>
            <p className={'text-xl text-primary'}>Edge that compounds.</p>
            <p className={'text-sm text-ink-subtle mt-4'}>
              Probabilities come from a fitted goal model rated on club Elo, recent venue form and
              rest days. Fixtures are re-synced once a day.
            </p>
            <LiveRoi className={'mt-6'} />
          </div>

          <div className={'flex flex-col gap-4 border-t border-line pt-12'}>
            <p className={'text-sm text-ink-subtle'}>
              Every selection is logged with the price it was taken at and settled against the final
              result, so the ROI above is measured rather than promotional.
            </p>
            <p className={'text-xs text-ink-subtle'}>
              For informational purposes only. StatPitch does not facilitate or endorse gambling.
            </p>
          </div>
        </div>
      </div>

      <div className={'flex items-center justify-center w-full lg:w-4/6'}>
        <div className={'w-90 flex flex-col justify-center gap-8 h-full '}>
          <div
            className={
              'flex items-center font-semibold gap-2 self-center mt-14 lg:hidden tracking-tight'
            }
          >
            <LogoIcon className={'h-10 w-8 text-primary'} />
            <p className={'text-xl'}>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </div>

          <div
            role='group'
            aria-label='Authentication mode'
            className={
              'flex gap-4 mt-4 bg-card border border-line h-12 justify-between rounded-md items-center'
            }
          >
            <button
              type='button'
              aria-pressed={!isNewAccount}
              className={`w-60 h-10 ml-1 rounded-md text-sm font-medium cursor-pointer ${isNewAccount ? 'text-ink-subtle' : 'bg-secondary text-ink'}`}
              onClick={() => setIsNewAccount(false)}
            >
              Sign in
            </button>
            <button
              type='button'
              aria-pressed={isNewAccount}
              className={`w-60 h-10 mr-1 rounded-md text-sm font-medium cursor-pointer ${isNewAccount ? 'bg-secondary text-ink' : 'text-ink-subtle'}`}
              onClick={() => setIsNewAccount(true)}
            >
              Create account
            </button>
          </div>

          <div>
            <h1 className={'text-xl font-semibold'}>
              {isNewAccount ? 'Get started free' : 'Welcome back'}
            </h1>
            <p className={'text-sm text-ink-subtle'}>
              {isNewAccount
                ? '14-day free trial. No credit card required.'
                : 'Sign in to access your predictions dashboard'}
            </p>
          </div>

          {/* Authentication is not wired up yet; the submit handler only stops the page reloading. */}
          <form className={'flex flex-col gap-8'} onSubmit={(event) => event.preventDefault()}>
            <div className={'flex flex-col gap-4'}>
              {isNewAccount && (
                <div className={'flex flex-col gap-1'}>
                  <label htmlFor='name' className={'eyebrow text-ink-subtle'}>
                    Full name
                  </label>
                  <input
                    id='name'
                    name='name'
                    type='text'
                    autoComplete='name'
                    required
                    className={
                      'w-full p-3 rounded-md bg-secondary border border-line-strong text-sm'
                    }
                    placeholder={'Your name'}
                  />
                </div>
              )}
              <div className={'flex flex-col gap-1'}>
                <label htmlFor='email' className={'eyebrow text-ink-subtle'}>
                  Email
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  className={'w-full p-3 rounded-md bg-secondary border border-line-strong text-sm'}
                  placeholder={'you@example.com'}
                />
              </div>
              <div className={'flex flex-col gap-1'}>
                <label htmlFor='password' className={'eyebrow text-ink-subtle'}>
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete={isNewAccount ? 'new-password' : 'current-password'}
                  required
                  className={'w-full p-3 rounded-md bg-secondary border border-line-strong text-sm'}
                  placeholder={'•••••••••'}
                />
              </div>
              {!isNewAccount && (
                <a href='#reset' className={'text-xs self-end text-ink-subtle'}>
                  Forgot password?
                </a>
              )}
            </div>

            <button
              type='submit'
              className={
                'flex items-center justify-center gap-2 bg-primary text-background p-3 rounded-md text-sm font-semibold cursor-pointer'
              }
            >
              <BrainIcon className={'h-4 w-4'} />
              {isNewAccount ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className={'flex items-center gap-2'}>
            <div className={'h-0.5 w-full bg-secondary'}></div>
            <p className={'text-xs text-ink-subtle shrink-0'}>or continue with</p>
            <div className={'h-0.5 w-full bg-secondary'}></div>
          </div>
          <div className={'flex gap-2'}>
            <button
              type='button'
              className={
                'flex w-1/2 items-center justify-center gap-2 bg-secondary p-2 rounded-md text-sm font-medium border border-line cursor-pointer'
              }
            >
              <GoogleIcon className={'h-4 w-4'} />
              Google
            </button>
            <button
              type='button'
              className={
                'flex w-1/2 items-center justify-center gap-2 bg-secondary p-2 rounded-md text-sm font-medium border border-line cursor-pointer'
              }
            >
              <GithubIcon className={'h-4 w-4'} />
              Github
            </button>
          </div>
          <p className={'flex items-center gap-2 self-center text-sm text-ink-subtle'}>
            {isNewAccount ? 'Already have an account?' : "Don't have an account?"}
            <button
              type='button'
              className={'text-primary cursor-pointer'}
              onClick={() => setIsNewAccount(!isNewAccount)}
            >
              {isNewAccount ? 'Sign in' : 'Sign up free'}
            </button>
          </p>
          <p className={'text-xs text-ink-subtle'}>
            By continuing you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
