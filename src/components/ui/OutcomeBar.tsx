interface OutcomeBarProps {
  home: number
  draw: number
  away: number
}

/** Home / draw / away split as a single stacked bar. Values are 0–100. */
function OutcomeBar({ home, draw, away }: OutcomeBarProps) {
  return (
    <div className={'flex justify-center items-center gap-px mt-4 w-full mx-auto'}>
      <div className='h-1 bg-primary rounded-l-full lg:h-2' style={{ width: `${home}%` }} />
      <div className='h-1 bg-line-strong lg:h-2' style={{ width: `${draw}%` }} />
      <div className='h-1 bg-chart-2 rounded-r-full lg:h-2' style={{ width: `${away}%` }} />
    </div>
  )
}

export default OutcomeBar
