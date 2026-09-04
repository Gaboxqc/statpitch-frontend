export interface Competition {
  id: string
  name: string
  /** Shorter label for the filter strip, where horizontal room is scarce. */
  short: string
  /** Whether a free account sees this competition's fixtures at all. */
  free: boolean
  /** Whether an odds market exists to quote this competition against. */
  priced: boolean
  /**
   * Whether the selection rule was measured to earn here. Strictly narrower
   * than `priced`: the Eredivisie and Primeira Liga are served in full and can
   * never produce a bet, the first on a negative closing-line result and the
   * second on a sample too small to resolve. That is a finding, not a gap.
   */
  stakeable: boolean
}

/**
 * The four sets, named. Until the Primeira Liga, Eredivisie and Süper Lig
 * arrived these four rows would all have been the same one, which is why a
 * single `priced` boolean used to answer every question asked of it.
 */
const FREE_LEAGUE = { free: true, priced: true, stakeable: true } as const
const PAID_LEAGUE = { free: false, priced: true, stakeable: true } as const
/** Served, predicted and priced in full — and outside the rule's measured scope. */
const FORECAST_LEAGUE = { free: false, priced: true, stakeable: false } as const
/** No odds market exists, so a prediction is all there can ever be. */
const CUP = { free: false, priced: false, stakeable: false } as const

/**
 * The fallback table. `/competitions` is the source of truth and carries all
 * three flags itself — this stands in only until that query lands, and keeps
 * the app honest about a competition it has never heard of.
 *
 * The ids use Club Elo's ISO-3 country codes, so Portugal is `POR` and the
 * Netherlands `NED`. Opaque strings; they are matched exactly.
 */
export const COMPETITIONS: Competition[] = [
  { id: 'ENG.PL', name: 'Premier League', short: 'Premier League', ...FREE_LEAGUE },
  { id: 'ESP.LALIGA', name: 'La Liga', short: 'La Liga', ...FREE_LEAGUE },
  { id: 'GER.BUNDESLIGA', name: 'Bundesliga', short: 'Bundesliga', ...FREE_LEAGUE },
  { id: 'ITA.SERIEA', name: 'Serie A', short: 'Serie A', ...FREE_LEAGUE },
  { id: 'FRA.LIGUE1', name: 'Ligue 1', short: 'Ligue 1', ...FREE_LEAGUE },
  { id: 'TUR.SUPERLIG', name: 'Süper Lig', short: 'Süper Lig', ...PAID_LEAGUE },
  { id: 'POR.PRIMEIRA', name: 'Primeira Liga', short: 'Primeira Liga', ...FORECAST_LEAGUE },
  { id: 'NED.EREDIVISIE', name: 'Eredivisie', short: 'Eredivisie', ...FORECAST_LEAGUE },
  { id: 'UEFA.UCL', name: 'Champions League', short: 'UCL', ...CUP },
  { id: 'UEFA.UEL', name: 'Europa League', short: 'UEL', ...CUP },
  { id: 'ENG.FA_CUP', name: 'FA Cup', short: 'FA Cup', ...CUP },
  { id: 'GER.DFB_POKAL', name: 'DFB-Pokal', short: 'DFB-Pokal', ...CUP },
  { id: 'ITA.COPPA_ITALIA', name: 'Coppa Italia', short: 'Coppa Italia', ...CUP },
  { id: 'ESP.COPA_DEL_REY', name: 'Copa del Rey', short: 'Copa del Rey', ...CUP },
  { id: 'FRA.COUPE_DE_FRANCE', name: 'Coupe de France', short: 'Coupe de France', ...CUP },
]

const BY_ID = new Map(COMPETITIONS.map((competition) => [competition.id, competition]))

/** Falls back to the raw id so a competition added upstream still renders something. */
export function competitionName(id: string): string {
  return BY_ID.get(id)?.name ?? id
}

export function competition(id: string): Competition | undefined {
  return BY_ID.get(id)
}

/**
 * What to call a fixture's competition, and what to draw beside it.
 *
 * The payload carries all three, in every shape, so it is preferred over the
 * table above: a competition added upstream reads correctly here before anybody
 * remembers to add a row. The table remains the fallback for the flags when the
 * `/competitions` query has not landed.
 */
export function fixtureCompetition(fixture: {
  competition_id: string
  competition_name?: string | null
  competition_short_name?: string | null
  competition_icon_url?: string | null
}): { id: string; name: string; short: string; icon: string | null } {
  const known = BY_ID.get(fixture.competition_id)
  return {
    id: fixture.competition_id,
    name: fixture.competition_name || known?.name || fixture.competition_id,
    short: fixture.competition_short_name || known?.short || fixture.competition_id,
    icon: fixture.competition_icon_url ?? null,
  }
}
