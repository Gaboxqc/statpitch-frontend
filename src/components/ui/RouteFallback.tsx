/** Shown while a lazily-loaded route chunk is in flight. */
function RouteFallback() {
  return (
    <div className={'min-h-screen bg-background flex items-center justify-center'}>
      <div
        className={'h-8 w-8 rounded-full border-2 border-line-strong border-t-primary animate-spin'}
      />
      <span className={'sr-only'}>Loading page</span>
    </div>
  )
}

export default RouteFallback
