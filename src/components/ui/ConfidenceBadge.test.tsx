import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConfidenceBadge from './ConfidenceBadge'
import {
  fixtureFixture,
  freeFixtureFixture,
  teaserFixtureFixture,
  unpricedFixtureFixture,
} from '../../test/fixtures'

describe('ConfidenceBadge in a list', () => {
  it('warns when the band is low', () => {
    render(<ConfidenceBadge fixture={unpricedFixtureFixture} />)

    expect(screen.getByText(/low confidence/i)).toBeInTheDocument()
  })

  // Most fixtures sit at medium until odds land, so a badge on every card would
  // carry no information at all.
  it('stays quiet on the bands that say nothing new', () => {
    const { unmount } = render(<ConfidenceBadge fixture={fixtureFixture} />)
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument()
    unmount()

    render(<ConfidenceBadge fixture={{ ...fixtureFixture, confidence: 'medium' }} />)
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument()
  })
})

describe('ConfidenceBadge on a single fixture', () => {
  // Here the band is one of the things the reader came for, so all three show.
  it('states the band whatever it is', () => {
    const { unmount } = render(<ConfidenceBadge fixture={fixtureFixture} showWhenClean={true} />)
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument()
    unmount()

    render(
      <ConfidenceBadge
        fixture={{ ...fixtureFixture, confidence: 'medium' }}
        showWhenClean={true}
      />,
    )
    expect(screen.getByText(/medium confidence/i)).toBeInTheDocument()
  })

  it('carries the reasons for anyone who hovers', () => {
    render(<ConfidenceBadge fixture={unpricedFixtureFixture} showWhenClean={true} />)

    expect(screen.getByText(/low confidence/i)).toHaveAttribute(
      'title',
      expect.stringContaining('no measured Elo'),
    )
  })
})

describe('ConfidenceBadge below a full payload', () => {
  it('reports the fallback model, which every shape publishes', () => {
    render(
      <ConfidenceBadge fixture={{ ...teaserFixtureFixture, prediction_source: 'elo-poisson' }} />,
    )

    expect(screen.getByText(/fallback model/i)).toBeInTheDocument()
  })

  it('renders nothing at all when the payload cannot say', () => {
    const { container } = render(
      <ConfidenceBadge fixture={freeFixtureFixture} showWhenClean={true} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
