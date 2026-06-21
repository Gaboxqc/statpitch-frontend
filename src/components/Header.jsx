import { LogoIcon, MenuIcon } from '../assets/icons/index.js'

function Header() {
  return (
    <header className={'container mx-auto bg-background py-2'}>
      <nav className={'flex text-foreground items-center justify-between mx-2 md:mx-0 text-lg'}>
        <div className={'flex items-center font-bold gap-2'}>
          <LogoIcon className={'h-6 w-6 text-primary'} />

          <p>
            Stat<span className={'text-primary'}>Pitch</span>
          </p>
        </div>

        <div className={'hidden md:flex gap-4 items-center'}>
          <div className={'bg-accent py-1.5 px-2 rounded-sm text-sm'}>Dashboard</div>
          <div className={' p-1.5 rounded-sm text-sm'}>Pricing</div>
        </div>

        <div className={'flex gap-4 items-center'}>
          <a href='#' className={'text-md text-sm text-secondary-foreground'}>
            Sign in
          </a>
          <button
            className={
              'border border-secondary-foreground/20 rounded-md p-1 bg-secondary-foreground/15 m-2 md:hidden'
            }
          >
            <MenuIcon className={'h-6 w-6 text-secondary-foreground'} />
          </button>
          <button
            className={
              'bg-primary text-secondary font-bold text-sm rounded-sm py-1.5 px-2 m-2 md:block hidden'
            }
          >
            Get started
          </button>
        </div>
      </nav>
    </header>
  )
}

export { Header }
