import type { EloSource, PredictionSource } from '../types/api'

/** Turns `matchday_1` into `Matchday 1`, as a fallback for unmapped values. */
export function humanise(value: string): string {
  const spaced = value.replace(/_/g, ' ').trim()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/**
 * The model's feature names, in the language a reader would use. Anything not
 * listed falls back to {@link humanise}, so a feature added upstream still
 * renders rather than disappearing.
 */
const FEATURE_LABELS: Record<string, string> = {
  elo_diff: 'Elo difference',
  home_elo: 'Home Elo',
  away_elo: 'Away Elo',
  home_rest_days: 'Home rest days',
  away_rest_days: 'Away rest days',
  home_venue_scored_10: 'Home scoring form, last 10',
  home_venue_conceded_10: 'Home defensive form, last 10',
  away_venue_scored_10: 'Away scoring form, last 10',
  away_venue_conceded_10: 'Away defensive form, last 10',
  h2h_matches: 'Head-to-head history',
  home_matches_played: 'Home matches played',
  away_matches_played: 'Away matches played',
  other: 'Everything else',
}

export function featureLabel(feature: string): string {
  return FEATURE_LABELS[feature] ?? humanise(feature)
}

interface EloSourceDescription {
  label: string
  /** 1 is a measured rating, 4 is a bare default. Lower is stronger evidence. */
  tier: number
  hint: string
}

const ELO_SOURCES: Record<EloSource, EloSourceDescription> = {
  club_elo: { label: 'Measured', tier: 1, hint: 'A real Club Elo rating for this side.' },
  entrant_prior: {
    label: 'Entrant prior',
    tier: 2,
    hint: 'No measured rating; estimated from comparable entrants to this competition.',
  },
  pooled_prior: {
    label: 'Pooled prior',
    tier: 3,
    hint: 'No measured rating; estimated from the pool of all sides.',
  },
  default: {
    label: 'Default',
    tier: 4,
    hint: 'No evidence at all; the model fell back to a flat starting rating.',
  },
}

export function eloSource(source: EloSource | null): EloSourceDescription | null {
  return source ? ELO_SOURCES[source] : null
}

const PREDICTION_SOURCES: Record<PredictionSource, { label: string; hint: string }> = {
  fitted_goal_model: {
    label: 'Fitted goal model',
    hint: 'The trained model.',
  },
  'elo-poisson': {
    label: 'Elo-Poisson fallback',
    hint: 'A measurably weaker fallback, used for fixtures that missed the last precompute run.',
  },
}

export function predictionSource(source: PredictionSource | null) {
  return source ? (PREDICTION_SOURCES[source] ?? { label: humanise(source), hint: '' }) : null
}
