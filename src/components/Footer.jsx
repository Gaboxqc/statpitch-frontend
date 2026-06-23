function Footer() {
  return (
    <footer
      className={
        'container mx-auto bg-background text-foreground text-center py-4 h-60 justify-between flex flex-col px-2'
      }
    >
      <div className={'flex flex-col gap-4'}>
        <p className={'text-xs text-secondary-foreground/60'}>
          Model v2 · Gradient Boost + LSTM Ensemble · Updated 14 min ago
        </p>
        <p className={'text-xs text-secondary-foreground/60'}>For informational purposes only.</p>
      </div>
      <div className={'flex flex-col gap-2 mx-2'}>
        <p className={'text-xs text-secondary-foreground/60'}>
          For informational purposes only. StatPitch does not facilitate, encourage, or endorse any
          form of gambling or wagering.{' '}
        </p>
        <p className={'text-xs text-secondary-foreground/60'}>© 2026 Pitch</p>
      </div>
    </footer>
  )
}

export default Footer
