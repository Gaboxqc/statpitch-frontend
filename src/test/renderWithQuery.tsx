import type { ReactElement, ReactNode } from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'

interface Options {
  /** Filters live in the query string, so tests set them by starting at a route. */
  route?: string
}

/** Retries off so failure states resolve immediately in tests. */
export function renderWithQuery(ui: ReactElement, { route = '/' }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </QueryClientProvider>
  )

  return render(ui, { wrapper: Wrapper })
}
