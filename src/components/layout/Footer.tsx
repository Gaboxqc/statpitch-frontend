import { useId, useState } from 'react'
import { BRAND, DISCLAIMER } from '../../constants/content'

function Footer() {
  const [isOpened, setIsOpened] = useState(false)
  const detailId = useId()
  return (
    <footer className={'bg-background text-ink mt-24 border-t border-line'}>
      <div className={'measure'}>
        <div
          className={
            'flex flex-col justify-between items-center gap-4 py-6 text-center lg:flex-row'
          }
        >
          <p
            className={
              'text-xs text-ink-subtle lg:shrink-0 text-start px-4 lg:px-0 lg:max-w-10/12 mb-4 lg:mb-0'
            }
          >
            <span className={'text-ink-muted'}>{DISCLAIMER.short}</span> {DISCLAIMER.body}{' '}
            <span id={detailId} hidden={!isOpened}>
              {DISCLAIMER.extended}{' '}
            </span>
            <button
              type='button'
              className={'text-ink-muted underline cursor-pointer'}
              aria-expanded={isOpened}
              aria-controls={detailId}
              onClick={() => setIsOpened((prev) => !prev)}
            >
              {isOpened ? 'Less' : 'Read more'}
            </button>
          </p>
          <p className={'text-xs text-ink-subtle'}>
            © {new Date().getFullYear()} {BRAND}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
