function SummaryBar() {
  return (
    <div
      className={
        'container mx-auto flex justify-between items-center py-4 px-2 bg-secondary-foreground/10 border-y border-secondary-foreground/20 '
      }
    >
      <ul className={'flex w-full text-secondary-foreground gap-6 text-sm overflow-x-scroll'}>
        <li className={'flex items-center gap-2 shrink-0'}>
          <p className={'text-sm'}>Predictions today</p>
          <p className={'text-lg text-foreground'}>6</p>
        </li>
        <li className={'flex items-center gap-2 shrink-0'}>
          <p>High confidence</p>
          <p className={'text-lg text-foreground'}>2</p>
        </li>
        <li className={'flex items-center gap-2 shrink-0'}>
          <p>30d model accuracy</p>
          <p className={'text-lg text-primary'}>71.4%</p>
        </li>
        <li className={'flex items-center gap-2 shrink-0'}>
          <p>30d ROI</p>
          <p className={'text-lg text-primary'}>+8.3%</p>
        </li>
      </ul>

      <button className={'hidden'}>DISCLAIMER</button>
    </div>
  )
}
export default SummaryBar
