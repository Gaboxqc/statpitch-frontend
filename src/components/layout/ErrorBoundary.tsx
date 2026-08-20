import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

/**
 * Last line of defence: without this, any render throw leaves a blank page.
 * Route-level errors are handled by the router; this catches everything else.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div
        role='alert'
        className={
          'min-h-screen bg-background text-ink flex flex-col items-center justify-center gap-4 px-4 text-center'
        }
      >
        <h1 className={'text-xl font-semibold'}>Something went wrong</h1>
        <p className={'text-sm text-ink-subtle max-w-md'}>
          The page failed to render. Reloading usually clears it.
        </p>
        <button
          type='button'
          onClick={() => window.location.reload()}
          className={'bg-primary text-background text-sm font-semibold rounded-md px-4 py-2'}
        >
          Reload page
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
