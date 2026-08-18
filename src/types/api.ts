/** Betting markets the model publishes, and the key `best_overall_bet` refers to. */
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

/** One fixture as returned by /today and /today/best. */
export interface Prediction {
  id: number
  commence_time: string
  model_version: string | null

  home_team: string
  away_team: string
  home_flag_url: string
  away_flag_url: string
  home_xg: number
  away_xg: number

  home_win_prob: number
  draw_prob: number
  away_win_prob: number

  best_overall_bet: MarketKey | null

  ev_home: number
  odds_home: number
  kelly_home: number
  ev_draw: number
  odds_draw: number
  kelly_draw: number
  ev_away: number
  odds_away: number
  kelly_away: number

  btts_yes: number
  ev_btts_yes: number
  odds_btts_yes: number
  kelly_btts_yes: number
  btts_no: number
  ev_btts_no: number
  odds_btts_no: number
  kelly_btts_no: number

  over_1_5: number
  ev_over_1_5: number
  odds_over_1_5: number
  kelly_over_1_5: number
  over_2_5: number
  ev_over_2_5: number
  odds_over_2_5: number
  kelly_over_2_5: number
  over_3_5: number
  ev_over_3_5: number
  odds_over_3_5: number
  kelly_over_3_5: number

  under_1_5: number
  ev_under_1_5: number
  odds_under_1_5: number
  kelly_under_1_5: number
  under_2_5: number
  ev_under_2_5: number
  odds_under_2_5: number
  kelly_under_2_5: number
  under_3_5: number
  ev_under_3_5: number
  odds_under_3_5: number
  kelly_under_3_5: number
}

/** Rates are 0–1 fractions and are null until enough matches have settled. */
export interface Stats {
  predictions_today: number
  high_confidence_today: number
  high_confidence_threshold: number
  value_bets_today: number
  accuracy_30d: number | null
  roi_30d: number | null
  settled_matches_30d: number
}

/** One row of the market breakdown, derived from a Prediction. */
export interface Market {
  key: MarketKey
  market: string
  ev: number
  odds: number
  prob: number
  kelly: number
}

export interface Pagination {
  offset?: number
  limit?: number
}
