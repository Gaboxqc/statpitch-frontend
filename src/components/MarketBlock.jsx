import BasicBarChart from './ui/BasicBarChart.jsx'

function getEVColor(EV) {
  if (EV > 0) return 'text-primary'
  return 'text-secondary-foreground/50'
}

function getKellyRender(kelly) {
  if (kelly <= 0)
    return <p className={'text-xs text-secondary-foreground/30'}>→ Skip | No positive edge</p>
  if (kelly > 0)
    return (
      <p
        className={
          'text-xs text-secondary-foreground/70 p-2 bg-primary/10 border border-primary/20 rounded-sm'
        }
      >
        CONSIDER{' '}
        <span className={'text-primary font-bold'}>
          Stake {kelly.toFixed(2) * 100}% of bankroll
        </span>
      </p>
    )
}

function getMarketNameRender(market, isBest) {
  if (isBest)
    return (
      <div className={'flex items-center gap-2'}>
        <p>{market}</p>
        <p className={'text-xs p-1 bg-primary/10 border border-primary/20 rounded-sm text-primary'}>
          BEST BET
        </p>
      </div>
    )
  return <p>{market}</p>
}

function MarketBlock({ market, prob, ev, odds, kelly, isBest }) {
  if (!prob || !ev || !odds) {
    return null
  }

  return (
    <div className={'flex flex-col justify-center items-center'}>
      <div className={'bg-accent/15 h-0.5 my-4 w-full'}></div>
      <div className={'flex w-full items-center justify-center'}>
        <div className={`${isBest ? 'block' : 'hidden'} h-50 w-0.5 bg-primary mr-4`}></div>
        <div className={'flex flex-col gap-4 w-full'}>
          <div className={'flex justify-between items-center gap-2 text-sm'}>
            {getMarketNameRender(market, isBest)}
            <p className={`${getEVColor(ev)} font-bold`}>{ev.toFixed(2)}% EV</p>
          </div>
          {getKellyRender(kelly)}
          <div className={'flex items-center gap-2 text-xs text-secondary-foreground/50'}>
            <p>
              BOOK <span className={'text-foreground'}>{odds}</span> |{' '}
            </p>
            <p>
              FAIR ODDS <span className={'text-foreground'}>{(1 / prob).toFixed(2)}</span> |{' '}
            </p>
            <p>
              MODEL <span className={'text-foreground'}>{(prob * 100).toFixed(2)}%</span>{' '}
            </p>
          </div>
          <div className={'flex flex-col gap-2'}>
            <BasicBarChart prob={prob.toFixed(2) * 100} />
            <div
              className={'flex justify-between items-center text-xs text-secondary-foreground/50'}
            >
              <p>
                Implied <span>{((1 / odds) * 100).toFixed(2)}%</span>
              </p>
              <p>
                Model <span>{prob.toFixed(2)}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarketBlock
