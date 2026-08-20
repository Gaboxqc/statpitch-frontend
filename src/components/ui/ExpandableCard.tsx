import { useId, useState } from 'react'
import { ShortArrowIcon } from '../../assets/icons/index'

function ExpandableCard({ title, description }: { title: string; description: string }) {
  const [isOpened, setIsOpened] = useState(false)
  const panelId = useId()

  return (
    <div
      className={`rounded-lg border w-full ${isOpened ? 'bg-accent/20 border-accent/50' : 'bg-accent/10 border-accent/20'}`}
    >
      <h3>
        <button
          type='button'
          className={'flex justify-between items-center w-full p-4 text-start cursor-pointer'}
          aria-expanded={isOpened}
          aria-controls={panelId}
          onClick={() => setIsOpened((prev) => !prev)}
        >
          <span className={'text-sm font-medium'}>{title}</span>
          <ShortArrowIcon
            className={`h-4 w-4 text-ink-subtle shrink-0 ${isOpened ? 'rotate-180' : ''}`}
          />
        </button>
      </h3>
      <div id={panelId} hidden={!isOpened}>
        <p
          className={'text-sm text-ink-subtle mx-4 mb-4 text-start border-t border-accent/40 pt-4'}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

export default ExpandableCard
