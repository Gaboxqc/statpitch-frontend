import { BrainIcon, GithubIcon, GoogleIcon, LogoIcon } from '../assets/icons/index.js'
import { useState } from 'react'
import { Link } from 'react-router'

function LoginPage() {
  const [isNewAccount, setIsNewAccount] = useState(false)
  return (
    <div className={'flex items-center w-screen'}>
      <div
        className={
          'border border-emerald-500/20 bg-zinc-900/60 h-screen bg-linear-to-br from-emerald-950/30 via-transparent to-blue-950/20 w-2/6 hidden lg:block'
        }
      >
        <div className={'p-8 flex flex-col justify-between h-full'}>
          <Link to={'/statpitch'} className={'items-center font-bold gap-2 hidden lg:flex'}>
            <LogoIcon className={'h-6 w-6 text-primary'} />
            <p className={'text-xl'}>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </Link>

          <div>
            <p className={'text-2xl'}>ML-powered predictions.</p>
            <p className={'text-2xl text-primary'}>Edge that compounds.</p>
            <p className={'text-sm text-foreground/40 mt-4'}>
              Our ensemble model processes 200+ features per match — form, xG, squad depth, referee
              bias — updated every 15 minutes.
            </p>
            <div className={'grid grid-cols-2 gap-4 mt-6'}>
              <div
                className={
                  'flex flex-col gap-2 bg-accent/20 border border-accent/40 rounded-md p-4'
                }
              >
                <p className={'text-xl text-primary'}>71.4%</p>
                <p className={'text-sm '}>Model accuracy</p>
                <p className={'text-xs text-foreground/40'}>30-day rolling</p>
              </div>
              <div
                className={
                  'flex flex-col gap-2 bg-accent/20 border border-accent/40 rounded-md p-4'
                }
              >
                <p className={'text-xl text-primary'}>+8.3%</p>
                <p className={'text-sm '}>ROI tracked</p>
                <p className={'text-xs text-foreground/40'}>This month</p>
              </div>
              <div
                className={
                  'flex flex-col gap-2 bg-accent/20 border border-accent/40 rounded-md p-4'
                }
              >
                <p className={'text-xl text-primary'}>1,200+</p>
                <p className={'text-sm '}>Markets covered</p>
                <p className={'text-xs text-foreground/40'}>Daily</p>
              </div>
              <div
                className={
                  'flex flex-col gap-2 bg-accent/20 border border-accent/40 rounded-md p-4'
                }
              >
                <p className={'text-xl text-primary'}>38</p>
                <p className={'text-sm '}>Leagues</p>
                <p className={'text-xs text-foreground/40'}>Top competitions</p>
              </div>
            </div>
          </div>

          <div className={'flex flex-col gap-4 border-t border-accent/50 pt-12'}>
            <p className={'text-sm text-foreground/40'}>
              "StatPitch changed how I approach value betting. The ML edge indicators are genuinely
              different from anything else out there."
            </p>
            <div className={'flex items-center gap-2'}>
              <p className={'bg-accent rounded-full h-10 w-10 content-center text-center'}>LM</p>
              <div>
                <p>Lionel Messi</p>
                <p className={'text-xs text-foreground/40'}>
                  Pro subscriber <span>• 14 months</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={'flex items-center justify-center w-full lg:w-4/6'}>
        <div className={'w-90 flex flex-col justify-center gap-8 h-full '}>
          <div className={'flex items-center font-bold gap-2 self-center mt-14 lg:hidden'}>
            <LogoIcon className={'h-10 w-8 text-primary'} />
            <p className={'text-2xl'}>
              Stat<span className={'text-primary'}>Pitch</span>
            </p>
          </div>

          <div
            className={'flex gap-4 mt-4 bg-accent/40 h-12 justify-between rounded-sm items-center'}
          >
            <button
              className={`w-60 h-10 ml-1 rounded-sm text-sm ${isNewAccount ? 'text-foreground/50' : 'bg-accent/50 text-foreground'}`}
              onClick={() => setIsNewAccount(false)}
            >
              Sign in
            </button>
            <button
              className={`w-60 h-10  mr-1 rounded-sm text-sm ${isNewAccount ? 'bg-accent/50 text-foreground' : 'text-foreground/50'}`}
              onClick={() => setIsNewAccount(true)}
            >
              Create account
            </button>
          </div>

          <div>
            <p className={`text-xl ${isNewAccount ? 'hidden' : 'block'}`}>Welcome back</p>
            <p
              className={`text-sm text-secondary-foreground/50 ${isNewAccount ? 'hidden' : 'block'}`}
            >
              Sign in to access your predictions dashboard
            </p>
            <p className={`text-xl ${isNewAccount ? 'block' : 'hidden'}`}>Get started free</p>
            <p
              className={`text-sm text-secondary-foreground/50 ${isNewAccount ? 'block' : 'hidden'}`}
            >
              14-day free trial. No credit card required.
            </p>
          </div>

          <div className={'flex flex-col gap-4'}>
            <div className={`flex flex-col gap-1 ${isNewAccount ? 'block' : 'hidden'}`}>
              <p className={'text-sm text-foreground/40'}>FULL NAME</p>
              <input
                type='text'
                className={'w-full p-3 rounded-lg bg-accent/20 focus:outline-none text-sm'}
                placeholder={'Gabriel Mayorga'}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <p className={'text-sm text-foreground/40'}>EMAIL</p>
              <input
                type='text'
                className={'w-full p-3 rounded-lg bg-accent/20 focus:outline-none text-sm'}
                placeholder={'you@example.com'}
              />
            </div>
            <div className={'flex flex-col gap-1'}>
              <p className={'text-sm text-foreground/40'}>PASSWORD</p>
              <input
                type='password'
                className={'w-full p-3 rounded-lg bg-accent/20 focus:outline-none text-sm'}
                placeholder={'*********'}
              />
            </div>
            <p
              className={`text-xs self-end text-foreground/40 cursor-pointer ${isNewAccount ? 'hidden' : 'block'}`}
            >
              Forgot password?
            </p>
          </div>
          <button
            className={
              'flex items-center justify-center gap-2 bg-primary text-background p-3 rounded-md font-bold text-sm '
            }
          >
            <BrainIcon className={'h-4 w-4'} />
            Sign in
          </button>

          <div className={'flex items-center gap-2'}>
            <div className={'h-0.5 w-full bg-accent/50'}></div>
            <p className={'text-xs text-foreground/30 shrink-0'}>or continue with</p>
            <div className={'h-0.5 w-full bg-accent/50'}></div>
          </div>
          <div className={'flex gap-2'}>
            <button
              className={
                'flex w-1/2 items-center justify-center gap-2 bg-accent/20 p-2 rounded-md font-bold text-sm border border-accent/30'
              }
            >
              <GoogleIcon className={'h-4 w-4'} />
              Google
            </button>
            <button
              className={
                'flex w-1/2 items-center justify-center gap-2 bg-accent/20 p-2 rounded-md font-bold text-sm border border-accent/30'
              }
            >
              <GithubIcon className={'h-4 w-4'} />
              Github
            </button>
          </div>
          <div className={'flex items-center gap-2 self-center'}>
            <p className={`text-sm text-foreground/40 ${isNewAccount ? 'hidden' : 'block'}`}>
              Dont have an account?
            </p>
            <p className={`text-primary ${isNewAccount ? 'hidden' : 'block'}`}>Sign up free</p>
            <p className={`text-sm text-foreground/40 ${isNewAccount ? 'block' : 'hidden'}`}>
              Already have an account?
            </p>
            <p className={`text-primary ${isNewAccount ? 'block' : 'hidden'}`}>Sign in</p>
          </div>
          <p className={'text-xs text-foreground/30'}>
            By continuing you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
