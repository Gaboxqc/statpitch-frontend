import { afterEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithQuery } from '../test/renderWithQuery'
import { useCompetitionScope } from './queries'
import * as service from '../services/predictions'
import type { CompetitionInfo } from '../types/api'

const row = (
  competition_id: string,
  free_tier: boolean,
  priced: boolean,
  stakeable: boolean,
): CompetitionInfo => ({
  competition_id,
  name: competition_id,
  short_name: competition_id,
  icon_url: null,
  free_tier,
  priced,
  stakeable,
})

/** One line, one text node, so a count and a flag are matched together. */
function Probe({ id }: { id: string }) {
  const scope = useCompetitionScope()
  return (
    <p>
      {[
        `${scope.counts.total}/${scope.counts.priced}/${scope.counts.stakeable}`,
        scope.isFree(id) ? 'free' : 'paid',
        scope.isPriced(id) ? 'priced' : 'unpriced',
        scope.isStakeable(id) ? 'stakeable' : 'forecast-only',
      ].join(' ')}
    </p>
  )
}

afterEach(() => vi.restoreAllMocks())

describe('useCompetitionScope', () => {
  /**
   * The whole reason this exists. One boolean used to answer all three
   * questions because the three sets were the same five leagues; a league that
   * is priced in full and still outside the rule's scope is the case that
   * breaks it.
   */
  it('keeps priced and stakeable apart', async () => {
    vi.spyOn(service, 'getCompetitions').mockResolvedValue([
      row('ENG.PL', true, true, true),
      row('NED.EREDIVISIE', false, true, false),
      row('UEFA.UCL', false, false, false),
    ])
    renderWithQuery(<Probe id={'NED.EREDIVISIE'} />)

    expect(await screen.findByText('3/2/1 paid priced forecast-only')).toBeInTheDocument()
  })

  it('reads a cup as carrying no market at all', async () => {
    vi.spyOn(service, 'getCompetitions').mockResolvedValue([
      row('ENG.PL', true, true, true),
      row('UEFA.UCL', false, false, false),
    ])
    renderWithQuery(<Probe id={'UEFA.UCL'} />)

    expect(await screen.findByText('2/1/1 paid unpriced forecast-only')).toBeInTheDocument()
  })

  /**
   * A competition nobody has heard of gets no claim made about it: saying it is
   * outside a measured scope would be a statement about a measurement that was
   * never taken. `isFree` is the exception, because it gates rather than
   * describes.
   */
  it('makes no claim about a competition it has never seen', async () => {
    vi.spyOn(service, 'getCompetitions').mockResolvedValue([row('ENG.PL', true, true, true)])
    renderWithQuery(<Probe id={'SCO.PREMIERSHIP'} />)

    expect(await screen.findByText('1/1/1 paid priced stakeable')).toBeInTheDocument()
  })

  // Until the query lands there is still a question to answer, and the local
  // table answers it rather than the app rendering every league as unknown.
  it('stands the local table in before the API answers', () => {
    vi.spyOn(service, 'getCompetitions').mockReturnValue(new Promise(() => null))
    renderWithQuery(<Probe id={'POR.PRIMEIRA'} />)

    expect(screen.getByText('15/8/6 paid priced forecast-only')).toBeInTheDocument()
  })
})
