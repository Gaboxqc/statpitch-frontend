function QueryError({ error, className = '' }: { error: Error | null; className?: string }) {
  return (
    <div
      role='alert'
      className={`flex flex-col gap-1 rounded-md border border-chart-5/30 bg-chart-5/10 px-4 py-3 text-center ${className}`}
    >
      <p className={'text-sm text-foreground'}>We couldn&apos;t load this data.</p>
      <p className={'text-xs text-secondary-foreground/60'}>{error?.message}</p>
    </div>
  )
}

export default QueryError
