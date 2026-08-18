export interface Competition {
  id: string
  name: string
  /** Shorter label for the filter strip, where horizontal room is scarce. */
  short: string
  /**
   * Whether an odds market exists to price this competition against. StatPitch
   * covers all twelve, but only the five leagues can ever produce a bet — the
   * cups are prediction-only by construction, not by accident.
   */
  priced: boolean
}

export const COMPETITIONS: Competition[] = [
  { id: 'ENG.PL', name: 'Premier League', short: 'Premier League', priced: true },
  { id: 'ESP.LALIGA', name: 'La Liga', short: 'La Liga', priced: true },
  { id: 'GER.BUNDESLIGA', name: 'Bundesliga', short: 'Bundesliga', priced: true },
  { id: 'ITA.SERIEA', name: 'Serie A', short: 'Serie A', priced: true },
  { id: 'FRA.LIGUE1', name: 'Ligue 1', short: 'Ligue 1', priced: true },
  { id: 'UEFA.UCL', name: 'Champions League', short: 'UCL', priced: false },
  { id: 'UEFA.UEL', name: 'Europa League', short: 'UEL', priced: false },
  { id: 'ENG.FA_CUP', name: 'FA Cup', short: 'FA Cup', priced: false },
  { id: 'GER.DFB_POKAL', name: 'DFB-Pokal', short: 'DFB-Pokal', priced: false },
  { id: 'ITA.COPPA_ITALIA', name: 'Coppa Italia', short: 'Coppa Italia', priced: false },
  { id: 'ESP.COPA_DEL_REY', name: 'Copa del Rey', short: 'Copa del Rey', priced: false },
  { id: 'FRA.COUPE_DE_FRANCE', name: 'Coupe de France', short: 'Coupe de France', priced: false },
]

const BY_ID = new Map(COMPETITIONS.map((competition) => [competition.id, competition]))

/** Falls back to the raw id so a competition added upstream still renders something. */
export function competitionName(id: string): string {
  return BY_ID.get(id)?.name ?? id
}

export function competition(id: string): Competition | undefined {
  return BY_ID.get(id)
}
