import { useId, useState } from 'react'
import { BRAND, DISCLAIMER } from '../../constants/content'

function Footer() {
  const [isOpened, setIsOpened] = useState(false)
  const detailId = useId()
  return (
    <footer
      className={
        'container mx-auto bg-background text-foreground text-center py-2 lg:py-0 h-fit gap-12 justify-between flex flex-col px-2 mt-16'
      }
    >
      <div className={'border-t border-secondary-foreground/10 pt-4 w-screen self-center'}>
        <div
          className={
            'container mx-auto flex flex-col justify-between items-center lg:flex-row pb-4'
          }
        >
          <p
            className={
              'text-xs text-secondary-foreground/60 lg:shrink-0 text-start px-4 lg:px-0 lg:max-w-10/12 mb-4 lg:mb-0'
            }
          >
            <span className={'text-secondary-foreground'}>{DISCLAIMER.short}</span>{' '}
            {DISCLAIMER.body}{' '}
            <span id={detailId} hidden={!isOpened}>
              {DISCLAIMER.extended}{' '}
            </span>
            <button
              type='button'
              className={'text-secondary-foreground underline cursor-pointer'}
              aria-expanded={isOpened}
              aria-controls={detailId}
              onClick={() => setIsOpened((prev) => !prev)}
            >
              {isOpened ? 'Less' : 'Read more'}
            </button>
          </p>
          <p className={'text-xs text-secondary-foreground/60'}>
            © {new Date().getFullYear()} {BRAND}
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
