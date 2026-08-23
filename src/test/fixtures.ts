import type { FreeFixture, FullFixture, SettledBet, Stats, TeaserFixture } from '../types/api'

/**
 * Modelled on a real `/statpitch/fixtures/tomorrow` payload, then made
 * deliberately awkward: the h2h markets are priced but the goals and BTTS
 * markets are not (the default `ODDS_API_MARKETS=h2h` quota setting), the
 * away side carries a positive EV that still produced no pick because Kelly
 * stayed null, and one EV is exactly zero.
 */
export const fixtureFixture: FullFixture = {
  id: 2,
  fixture_id: 'ESP.LALIGA|2026-2027|Club Atlético de Madrid|Málaga CF',
  competition_id: 'ESP.LALIGA',
  competition_name: 'Spanish LALIGA',
  competition_short_name: 'LALIGA',
  competition_icon_url:
    'https://assets.gabrielmayorga.dev/statpitch/competitions/esp-laliga/4af38ab01c0313ff-512.webp',
  season: '2026-2027',
  stage: 'matchday_1',
  format: 'round_robin',

  match_date: '2026-08-19',
  source_date: '2026-08-19',
  kickoff: '19:00',
  commence_time: '2026-08-19T19:00:00',
  date_confirmed: true,

  home_team: 'Club Atlético de Madrid',
  away_team: 'Málaga CF',
  neutral_venue: false,
  home_crest_url: null,
  away_crest_url: null,

  prediction_source: 'fitted_goal_model',
  model_version: 'goals-20260813-bb07c99e',
  fully_rated: true,
  synced_at: '2026-08-18T07:42:06.933578',
  odds_coverage: true,
  locked: false,

  // Both clubs measured, one outcome past 70%, and a price to compare it to.
  confidence: 'high',
  confidence_reasons: [
    'Both clubs carry a measured Elo rating.',
    'One outcome is at or above 70%.',
    'A bookmaker price was available to compare against.',
  ],

  home_xg: 2.385954617038303,
  away_xg: 0.7715170310006697,
  home_elo: 1827.6751709,
  away_elo: 1568.62780762,
  home_elo_source: 'club_elo',
  away_elo_source: 'club_elo',
  home_win_prob: 0.7282520515944226,
  draw_prob: 0.17362052169156647,
  away_win_prob: 0.09812742671401076,
  over_1_5: 0.8274628731232342,
  over_2_5: 0.6112107390333168,
  over_3_5: 0.3880568133271343,
  btts_yes: 0.4924885428311951,
  btts_no: 0.507511,

  correct_scores: [
    { home: 2, away: 0, probability: 0.12106376111818812 },
    { home: 1, away: 0, probability: 0.09721313937550925 },
    { home: 3, away: 0, probability: 0.09629882805178608 },
    { home: 2, away: 1, probability: 0.09340275442885185 },
    { home: 1, away: 1, probability: 0.08253375565471507 },
  ],
  explanation: {
    units:
      'Contributions are additive in log goal-rate and multiplicative on goals: +0.31 multiplies the rate by e^0.31.',
    home: [
      {
        feature: 'elo_diff',
        feature_value: 259.0473632799999,
        contribution: 0.2871251106262207,
        multiplier: 1.3325909243318477,
      },
      {
        feature: 'home_rest_days',
        feature_value: 30.0,
        contribution: -0.025743598118424416,
        multiplier: 0.9745849429890797,
      },
      // The aggregated bucket carries no feature value of its own.
      {
        feature: 'other',
        feature_value: null,
        contribution: 0.07014920055144103,
        multiplier: 1.0726682120043258,
      },
    ],
    away: [
      {
        feature: 'elo_diff',
        feature_value: 259.0473632799999,
        contribution: -0.2955448627471924,
        multiplier: 0.7441260304362831,
      },
    ],
  },

  odds_home: 1.296,
  odds_draw: 5.534,
  odds_away: 10.82,
  odds_over_1_5: null,
  odds_under_1_5: null,
  odds_over_2_5: null,
  odds_under_2_5: null,
  odds_over_3_5: null,
  odds_under_3_5: null,
  odds_btts_yes: null,
  odds_btts_no: null,

  // Fractions, not percentages: 0.0617 is a +6.17% edge.
  ev_home: -0.0562,
  ev_draw: 0,
  ev_away: 0.0617,
  ev_over_1_5: null,
  ev_under_1_5: null,
  ev_over_2_5: null,
  ev_under_2_5: null,
  ev_over_3_5: null,
  ev_under_3_5: null,
  ev_btts_yes: null,
  ev_btts_no: null,

  // Null even on the market with a positive EV — the edge failed the Kelly minimum.
  kelly_home: null,
  kelly_draw: null,
  kelly_away: null,
  kelly_over_1_5: null,
  kelly_under_1_5: null,
  kelly_over_2_5: null,
  kelly_under_2_5: null,
  kelly_over_3_5: null,
  kelly_under_3_5: null,
  kelly_btts_yes: null,
  kelly_btts_no: null,

  best_bet: null,
  best_bet_odds: null,
  best_bet_prob: null,
  best_overall_bet: null,
  best_overall_odds: null,
  best_overall_prob: null,
  best_overall_ev: null,
  best_overall_kelly: null,

  home_score: null,
  away_score: null,
  actual_result: null,
}

/** A fixture that did carry a qualifying pick, so the betting UI has something to render. */
export const pickedFixtureFixture: FullFixture = {
  ...fixtureFixture,
  id: 3,
  fixture_id: 'ENG.PL|2026-2027|Arsenal FC|Everton FC',
  competition_id: 'ENG.PL',
  competition_name: 'English Premier League',
  competition_short_name: 'Premier League',
  competition_icon_url:
    'https://assets.gabrielmayorga.dev/statpitch/competitions/eng-pl/3fbb077c9331046d-512.webp',
  home_team: 'Arsenal FC',
  away_team: 'Everton FC',
  odds_btts_yes: 1.83,
  ev_btts_yes: 0.032,
  // Deliberately tiny: small enough to be worth almost nothing, large enough to qualify.
  kelly_btts_yes: 0.0049,
  best_bet: 'home_win',
  best_bet_odds: 1.296,
  best_bet_prob: 0.7282520515944226,
  best_overall_bet: 'btts_yes',
  best_overall_odds: 1.83,
  best_overall_prob: 0.4924885428311951,
  best_overall_ev: 0.032,
  best_overall_kelly: 0.0049,
}

/**
 * No odds event matched, so every pricing field is null while the prediction
 * stays fully populated. This is a normal state, not an error.
 */
export const unpricedFixtureFixture: FullFixture = {
  ...fixtureFixture,
  id: 4,
  fixture_id: 'UEFA.UCL|2026-2027|Feyenoord|Sparta Praha',
  competition_id: 'UEFA.UCL',
  competition_name: 'UEFA Champions League',
  competition_short_name: 'Champions League',
  // Null is a normal state: not every competition has published an icon.
  competition_icon_url: null,
  home_team: 'Feyenoord',
  away_team: 'Sparta Praha',
  odds_coverage: false,
  // A matchday placeholder rather than a real kickoff, so no time can be shown.
  date_confirmed: false,
  kickoff: null,
  commence_time: null,
  // One club had no measured Elo and fell back to a prior.
  fully_rated: false,
  away_elo: null,
  away_elo_source: 'pooled_prior',
  prediction_source: 'elo-poisson',
  // Data quality vetoes decisiveness however lopsided the numbers look.
  confidence: 'low',
  confidence_reasons: [
    'Sparta Praha had no measured Elo rating.',
    'The weaker fallback model produced these numbers.',
  ],
  odds_home: null,
  odds_draw: null,
  odds_away: null,
  ev_home: null,
  ev_draw: null,
  ev_away: null,
}

/**
 * What an anonymous visitor, or a free account that has not spent an unlock,
 * actually receives — taken key-for-key from a live `/fixtures/today` call.
 *
 * Built by deletion rather than by hand so it cannot drift from the full
 * payload above, and asserted against the real key count so that a field added
 * upstream fails here rather than silently widening the teaser.
 */
function teaserOf(full: FullFixture): TeaserFixture {
  const {
    id,
    fixture_id,
    competition_id,
    competition_name,
    competition_short_name,
    competition_icon_url,
    season,
    stage,
    format,
    match_date,
    source_date,
    kickoff,
    commence_time,
    date_confirmed,
    home_team,
    away_team,
    neutral_venue,
    home_crest_url,
    away_crest_url,
    prediction_source,
    model_version,
    synced_at,
    home_score,
    away_score,
    actual_result,
  } = full

  return {
    id,
    fixture_id,
    competition_id,
    competition_name,
    competition_short_name,
    competition_icon_url,
    season,
    stage,
    format,
    match_date,
    source_date,
    kickoff,
    commence_time,
    date_confirmed,
    home_team,
    away_team,
    neutral_venue,
    home_crest_url,
    away_crest_url,
    prediction_source,
    model_version,
    synced_at,
    home_score,
    away_score,
    actual_result,
    locked: true,
  }
}

/** 26 keys, `locked: true`, and no prediction of any kind. */
export const teaserFixtureFixture: TeaserFixture = teaserOf(fixtureFixture)

/**
 * A free account's unlocked fixture: 29 keys — the teaser plus the 1X2 call,
 * and nothing about the market. This is also the shape Match of the Day
 * returns to everyone, including anonymous visitors.
 */
export const freeFixtureFixture: FreeFixture = {
  ...teaserOf(fixtureFixture),
  locked: false,
  home_win_prob: fixtureFixture.home_win_prob,
  draw_prob: fixtureFixture.draw_prob,
  away_win_prob: fixtureFixture.away_win_prob,
}

/** A locked fixture that has already been played — the score is never withheld. */
export const settledTeaserFixture: TeaserFixture = {
  ...teaserOf(fixtureFixture),
  id: 6,
  match_date: '2026-08-17',
  home_score: 2,
  away_score: 0,
  actual_result: 'home_win',
}

/** A finished match, with the score and result the ledger settled against. */
export const settledFixtureFixture: FullFixture = {
  ...pickedFixtureFixture,
  id: 5,
  match_date: '2026-08-17',
  home_score: 3,
  away_score: 1,
  actual_result: 'home',
}

/** Mirrors the live API on a day with nothing settled: null ROI, not 0.0. */
export const emptyStatsFixture: Stats = {
  generated_for: '2026-08-18',
  timezone: 'America/Managua',
  window: { yesterday: '2026-08-17', today: '2026-08-18', tomorrow: '2026-08-19' },
  fixtures_today: 0,
  fixtures_tomorrow: 1,
  date_confirmed_today: 0,
  high_confidence_today: 0,
  high_confidence_threshold: 0.7,
  value_bets_today: 0,
  roi: [
    {
      basis: '1x2',
      week: {
        bets: 0,
        wins: 0,
        staked_units: 0,
        returned_units: 0,
        pnl_units: 0,
        roi_pct: null,
        hit_rate_pct: null,
      },
      month: {
        bets: 0,
        wins: 0,
        staked_units: 0,
        returned_units: 0,
        pnl_units: 0,
        roi_pct: null,
        hit_rate_pct: null,
      },
    },
    {
      basis: 'overall',
      week: {
        bets: 0,
        wins: 0,
        staked_units: 0,
        returned_units: 0,
        pnl_units: 0,
        roi_pct: null,
        hit_rate_pct: null,
      },
      month: {
        bets: 0,
        wins: 0,
        staked_units: 0,
        returned_units: 0,
        pnl_units: 0,
        roi_pct: null,
        hit_rate_pct: null,
      },
    },
  ],
}

/** A day with a settled record, including a losing series to prove the sign is rendered. */
export const settledStatsFixture: Stats = {
  ...emptyStatsFixture,
  fixtures_today: 4,
  date_confirmed_today: 3,
  high_confidence_today: 1,
  value_bets_today: 2,
  roi: [
    {
      basis: '1x2',
      week: {
        bets: 1,
        wins: 1,
        staked_units: 1,
        returned_units: 1.45,
        pnl_units: 0.45,
        roi_pct: 45,
        hit_rate_pct: 100,
      },
      month: {
        bets: 8,
        wins: 3,
        staked_units: 8,
        returned_units: 7.1,
        pnl_units: -0.9,
        roi_pct: -11.25,
        hit_rate_pct: 37.5,
      },
    },
    {
      basis: 'overall',
      week: {
        bets: 2,
        wins: 1,
        staked_units: 2,
        returned_units: 1.72,
        pnl_units: -0.28,
        roi_pct: -14,
        hit_rate_pct: 50,
      },
      month: {
        bets: 11,
        wins: 6,
        staked_units: 11,
        returned_units: 12.4,
        pnl_units: 1.4,
        roi_pct: 12.73,
        hit_rate_pct: 54.55,
      },
    },
  ],
}

export const settledBetFixture: SettledBet = {
  id: 2,
  fixture_id: 'ESP.LALIGA|2026-2027|FC Barcelona|Athletic Club',
  competition_id: 'ESP.LALIGA',
  home_team: 'FC Barcelona',
  away_team: 'Athletic Club',
  match_date: '2026-08-17',
  settled_at: '2026-08-18T07:03:12.869827',
  basis: 'overall',
  selection: 'over_2_5',
  probability: 0.534,
  odds_taken: 1.72,
  stake_units: 1,
  kelly_fraction: 0.05,
  won: true,
  pnl_units: 0.72,
  home_score: 3,
  away_score: 1,
  model_version: 'goals-20260813-bb07c99e',
}
