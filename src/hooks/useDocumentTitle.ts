import { useEffect } from 'react'
import { BRAND } from '../constants/content'

/** SPA navigation does not update the title on its own; each page sets its own. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} — ${BRAND}`
  }, [title])
}
