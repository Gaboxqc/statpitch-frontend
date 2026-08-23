/**
 * Mirrors the FixtureRead / StatsRead / SettledBetRead schemas published at
 * `/openapi.json`. Where the schema says `object` or `array` with no item type
 * (the server hands those through as raw dicts) the shape below was taken from
 * a live payload instead, and is marked as such.
 */

/** Betting markets the model publishes, and the key the pick fields refer to. */
export type MarketKey =
  | 'home_win'
  | 'draw'
  | 'away_win'
  | 'btts_yes'
  | 'btts_no'
  | 'over_1_5'
  | 'over_2_5'
  | 'over_3_5'
  | 'under_1_5'
  | 'under_2_5'
  | 'under_3_5'

/** Which tier of evidence backed a club's Elo, strongest first. */
export type EloSource = 'club_elo' | 'entrant_prior' | 'pooled_prior' | 'default'

/** `elo-poisson` is the measurably weaker fallback for fixtures that missed a precompute run. */
export type PredictionSource = 'fitted_goal_model' | 'elo-poisson'

export type DayKey = 'yesterday' | 'today' | 'tomorrow'

/** The two selection strategies the ledger tracks. They are never averaged together. */
export type Basis = '1x2' | 'overall'

/** One scoreline from the model's top-10 distribution. Shape taken from a live payload. */
export interface CorrectScore {
  home: number
  away: number
  probability: number
}

/**
 * One feature's contribution to a team's goal rate. Shape taken from a live
 * payload. `contribution` is additive in log goal-rate; `multiplier` is the
 * same figure as `e^contribution`, so a multiplier of 1.33 raises the rate 33%.
 * `feature_value` is null for the aggregated `other` row.
 */
export interface FeatureContribution {
  feature: string
  feature_value: number | null
  contribution: number
  multiplier: number
}

/** The model's own account of a prediction. Shape taken from a live payload. */
export interface Explanation {
  /** Prose describing what the contributions are measured in. */
  units: string
  home: FeatureContribution[]
  away: FeatureContribution[]
}

/** How much weight the API puts on its own numbers. Full payloads only. */
export type Confidence = 'low' | 'medium' | 'high'

/**
 * What every caller sees, whatever they are paying: who is playing, when, and
 * how it finished. No prediction of any kind.
 *
 * This is the whole payload for an anonymous visitor, and for a free account
 * that has not spent an unlock on this fixture.
 */
export interface TeaserFixture {
  // Identity
  id: number
  /** Composite natural key, e.g. `ESP.LALIGA|2026-2027|FC Barcelona|Athletic Club`. */
  fixture_id: string
  competition_id: string
  season: string | null
  /** Snake case, e.g. `matchday_1`. */
  stage: string | null
  /** Snake case, e.g. `round_robin`. */
  format: string | null

  // Scheduling
  /** Date only (`2026-08-19`), already resolved to the API's timezone. */
  match_date: string
  /** StatPitch's nominal date, used when no odds event fixed a real instant. */
  source_date: string
  /** Bare `"19:00"` with no timezone. Null whenever `date_confirmed` is false. */
  kickoff: string | null
  /** A real UTC instant, but serialised without a `Z` suffix. */
  commence_time: string | null
  /** False means a matchday placeholder, not a real kickoff. Render as "date TBC". */
  date_confirmed: boolean

  // Competition
  /**
   * Full name, e.g. `English Premier League`. Present on the teaser too — a
   * heading is not something anyone pays for — so nothing has to hold a local
   * table of names to render a list of locked fixtures.
   */
  competition_name: string
  /** What a heading should actually say, e.g. `Premier League`. */
  competition_short_name: string
  /** Absolute CDN URL at 512×512, or null. */
  competition_icon_url: string | null

  // Teams
  home_team: string
  away_team: string
  neutral_venue: boolean
  /** Absolute CDN URL, or null — some lower-division sides have no badge anywhere. */
  home_crest_url: string | null
  /** Null is a normal state. Fall back to a monogram, never a broken image. */
  away_crest_url: string | null

  // Provenance
  prediction_source: PredictionSource | null
  model_version: string
  /** UTC instant, serialised without a `Z` suffix. */
  synced_at: string

  // Result
  home_score: number | null
  away_score: number | null
  /**
   * Null until the match is settled. The value set is not published in the
   * schema and no settled fixture existed to sample, so this stays a string.
   */
  actual_result: string | null

  /**
   * Whether the prediction is withheld. True on every teaser, and the signal
   * the upsell is rendered from — never infer it from a missing field.
   */
  locked: boolean
}

/**
 * A free account's unlocked fixture: the 1X2 call, and nothing about the
 * market. Odds are a paid line, so there is no pricing here at all.
 */
export interface FreeFixture extends TeaserFixture {
  home_win_prob: number
  draw_prob: number
  away_win_prob: number
}

/**
 * Everything the model publishes. Pro and Elite receive byte-identical
 * payloads — Elite buys API access, not more data.
 *
 * Scale note: `ev_*` and `best_overall_ev` are **0–1 fractions**, not
 * percentages — a live payload carries `ev_away: 0.0617` for a +6.17% edge.
 * So are `kelly_*` and every `*_prob`. Only `roi_pct` and `hit_rate_pct` on the
 * stats payload are already on a 0–100 scale.
 *
 * Within this shape the old rule still holds: everything under Prediction is
 * present, and everything under Pricing and Picks is null whenever the fixture
 * could not be priced.
 */
export interface FullFixture extends FreeFixture {
  // Provenance
  /** False means at least one club fell back to a prior Elo. A much weaker claim. */
  fully_rated: boolean
  /** Whether an odds event matched at all. Individual markets can still be null. */
  odds_coverage: boolean

  /**
   * Data quality vetoes decisiveness: a 0.95 built on a prior bands `low`, not
   * high. Expect most fixtures to sit at medium until odds land.
   */
  confidence: Confidence
  /** Plain sentences, renderable as-is. */
  confidence_reasons: string[]

  // Prediction
  home_xg: number
  away_xg: number
  home_elo: number | null
  away_elo: number | null
  home_elo_source: EloSource | null
  away_elo_source: EloSource | null
  over_1_5: number
  over_2_5: number
  over_3_5: number
  btts_yes: number
  btts_no: number
  correct_scores: CorrectScore[] | null
  explanation: Explanation | null

  // Pricing — all null when unpriced, and individually null per unquoted market
  odds_home: number | null
  odds_draw: number | null
  odds_away: number | null
  odds_over_1_5: number | null
  odds_under_1_5: number | null
  odds_over_2_5: number | null
  odds_under_2_5: number | null
  odds_over_3_5: number | null
  odds_under_3_5: number | null
  odds_btts_yes: number | null
  odds_btts_no: number | null

  ev_home: number | null
  ev_draw: number | null
  ev_away: number | null
  ev_over_1_5: number | null
  ev_under_1_5: number | null
  ev_over_2_5: number | null
  ev_under_2_5: number | null
  ev_over_3_5: number | null
  ev_under_3_5: number | null
  ev_btts_yes: number | null
  ev_btts_no: number | null

  kelly_home: number | null
  kelly_draw: number | null
  kelly_away: number | null
  kelly_over_1_5: number | null
  kelly_under_1_5: number | null
  kelly_over_2_5: number | null
  kelly_under_2_5: number | null
  kelly_over_3_5: number | null
  kelly_under_3_5: number | null
  kelly_btts_yes: number | null
  kelly_btts_no: number | null

  // Picks — null when priced odds carried no edge clearing the Kelly minimum,
  // which is a normal outcome even on a fully priced fixture.
  best_bet: MarketKey | null
  best_bet_odds: number | null
  best_bet_prob: number | null
  best_overall_bet: MarketKey | null
  best_overall_odds: number | null
  best_overall_prob: number | null
  best_overall_ev: number | null
  best_overall_kelly: number | null
}

/**
 * A fixture in whichever of the three shapes the caller was entitled to.
 *
 * Gated fields are **absent from the JSON, never null**, so narrowing is done
 * with the `in` operator — see `utils/entitlement`. Optional chaining on a
 * missing key silently yields `undefined` and a blank cell; `null` means
 * something else entirely, namely that no market was offered.
 */
export type Fixture = TeaserFixture | FreeFixture | FullFixture

/**
 * One competition as the API describes it. `free_tier` is the only thing here
 * the frontend cannot work out for itself: whether a free account can see this
 * competition's fixtures at all.
 */
export interface CompetitionInfo {
  competition_id: string
  name: string
  short_name: string
  icon_url: string | null
  free_tier: boolean
}

/** The three dates the API currently considers live. Never derive these client-side. */
export interface ThreeDayWindow {
  yesterday: string
  today: string
  tomorrow: string
}

/**
 * One rolling window of the track record. `roi_pct` and `hit_rate_pct` are
 * already on a 0–100 scale, and are null — not zero — when nothing settled.
 */
export interface WindowRoi {
  bets: number
  wins: number
  staked_units: number
  returned_units: number
  pnl_units: number
  roi_pct: number | null
  hit_rate_pct: number | null
}

/** `week` is today and the six days before it; `month` is today and the previous 29. */
export interface BasisRoi {
  basis: Basis
  week: WindowRoi
  month: WindowRoi
}

export interface Stats {
  generated_for: string
  /** IANA zone the day boundaries are measured in, e.g. `America/Managua`. */
  timezone: string
  window: ThreeDayWindow
  fixtures_today: number
  fixtures_tomorrow: number
  date_confirmed_today: number
  high_confidence_today: number
  /** A 0–1 fraction, e.g. 0.7. */
  high_confidence_threshold: number
  value_bets_today: number
  /** Always exactly two entries, one per basis. */
  roi: BasisRoi[]
}

/** One banked bet. Append-only and permanent, unlike the fixture it came from. */
export interface SettledBet {
  id: number
  fixture_id: string
  competition_id: string
  home_team: string
  away_team: string
  match_date: string
  settled_at: string
  basis: Basis
  selection: MarketKey
  probability: number
  odds_taken: number
  stake_units: number
  kelly_fraction: number | null
  won: boolean
  /** `odds_taken - 1` on a winner, `-1` on a loser. */
  pnl_units: number
  home_score: number
  away_score: number
  model_version: string
}

/** One row of the market breakdown, derived from a Fixture. */
export interface Market {
  key: MarketKey
  market: string
  /** A 0–1 fraction. Null when the market was not quoted. */
  ev: number | null
  odds: number | null
  /** Always present — the model prices every market whether or not a book did. */
  prob: number
  /** Null both when unquoted and when the edge did not clear the minimum. */
  kelly: number | null
}

/** A collection response plus the `X-Total-Count` the API sets alongside it. */
export interface Page<T> {
  items: T[]
  total: number
}

export interface Pagination {
  offset?: number
  limit?: number
}

export interface FixtureQuery {
  day?: DayKey
  competition_id?: string
  value_bets_only?: boolean
}

export interface LedgerQuery extends Pagination {
  basis?: Basis
  competition_id?: string
}
