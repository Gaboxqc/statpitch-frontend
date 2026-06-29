import { BrainIcon } from '../assets/icons/index.js'
import MarketBlock from './MarketBlock.jsx'

function MatchCardContainer({ markets, bestBet, isOpened }) {
  return (
    <div className={`flex-col mt-12 gap-4 w-full ${isOpened ? 'flex' : 'hidden'}`}>
      <div className={'flex justify-between text-secondary-foreground/50 text-xs'}>
        <div className={'flex items-center gap-2'}>
          <BrainIcon className={'h-4 w-4 text-primary'} />
          <p>MARKET ANALYSIS</p>
        </div>
        <p className={'hidden'}>EV = (model prob x book odds) - 1</p>
      </div>
      {markets.map(({ key, market, ev, odds, prob, kelly }) => (
        <MarketBlock
          key={key}
          market={market}
          ev={ev}
          odds={odds}
          prob={prob}
          isBest={key === bestBet}
          kelly={kelly}
        />
      ))}
    </div>
  )
}

export default MatchCardContainer
