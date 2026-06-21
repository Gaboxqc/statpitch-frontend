import { LogoIcon, MenuIcon, ThunderIcon } from '../assets/icons/index.js'

function Header() {
  return (
    <header className={'container mx-auto bg-background'}>
      <nav className={'flex text-foreground items-center justify-between mx-4 pt-2 text-lg'}>
        <div className={'flex items-center font-bold'}>
          <div className={'border border-primary/40 rounded-md p-1 bg-primary/15 m-2'}>
            <LogoIcon className={'h-6 w-6 text-primary'} />
          </div>

          <p>
            Stat<span className={'text-primary'}>Pitch</span>
          </p>
        </div>

        <div className={'flex gap-4 items-center'}>
          <a href='#' className={'text-md text-sm text-secondary-foreground'}>
            Sign in
          </a>
          <div
            className={
              'border border-secondary-foreground/20 rounded-md p-1 bg-secondary-foreground/15 m-2'
            }
          >
            <MenuIcon className={'h-6 w-6 text-secondary-foreground'} />
          </div>
        </div>
      </nav>
    </header>
  )
}

export { Header }
