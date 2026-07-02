import { useState } from 'react'
import { ShortArrowIcon } from '../assets/icons/index.js'

function ExpandableCard({ title, description }) {
  const [isOpened, setIsOpened] = useState(false)
  return (
    <div
      className={`p-4 rounded-md border  w-full ${isOpened ? 'bg-accent/20 border-accent/50' : 'bg-accent/10 border-accent/20 '}`}
      onClick={() => setIsOpened((prev) => !prev)}
    >
      <div className={'flex justify-between items-center'}>
        <p className={'text-sm text-start'}>{title}</p>
        <ShortArrowIcon className={`h-4 w-4 text-accent ${isOpened ? 'rotate-180' : ''}`} />
      </div>
      <p
        className={`text-sm text-foreground/50 mt-4 text-start border-t border-accent/40 pt-4 ${isOpened ? 'block' : 'hidden'}`}
      >
        {description}
      </p>
    </div>
  )
}

export default ExpandableCard
