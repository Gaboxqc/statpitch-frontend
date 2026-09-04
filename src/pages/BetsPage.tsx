import { Link } from 'react-router'
import QueryError from '../components/ui/QueryError'
import Upsell from '../components/ui/Upsell'
import TeamCrest from '../components/ui/TeamCrest'
import { useBetsToday } from '../hooks/queries'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { isPaymentRequired } from '../services/api'
import { formatDecimal, formatFraction, formatSignedFraction } from '../utils/format'
import { displayName } from '../utils/teamName'
import { fixtureCompetition } from '../constants/competitions'
import { describeKickoffLong } from '../utils/datetime'
import { humanise } from '../utils/humanise'
import type { BetPick, BetsToday } from '../types/api'

/** Only strings are rendered: these fields ride in untyped objects on the wire. */
const asText = (value: unknown): string | null => (typeof value === 'string' ? value : null)

/** Numbers reach the screen too, but only when they really are numbers. */
const asFigure = (value: unknown): string | null =>
  typeof value === 'number' && Number.isFinite(value) ? String(value) : null

/**
 * The sentence every pick has to be read against.
 *
 * The rule has five seasons of measured closing-line value, but the 25-book
 * panel it runs on now has none — its calibration is inherited, not
 * re-measured. A pick rendered without this claims more than the evidence
 * supports, so it sits above the picks rather than beneath them, where it cannot
 * be scrolled past on the way to the numbers.
 */
function Caveat({ text }: { text: string }) {
  return (
    <div className={'rounded-lg border border-chart-3/40 bg-chart-3/10 px-4 py-3'}>
      <p className={'text-sm text-ink'}>{text}</p>
    </div>
  )
}

/** The counts that put three picks in the context of everything they came from. */
function Context({ bets }: { bets: BetsToday }) {
  const figures = [
    {
      label: 'Assessed',
      value: bets.assessed,
      hint: 'Selections priced and graded across the card',
    },
    {
      label: 'Cleared the rule',
      value: bets.qualified_by_rule,
      hint: 'Not all of these were staked',
    },
    { label: 'Staked', value: bets.count, hint: 'Picks recommended today' },
  ]

  return (
    <div className={'flex flex-col gap-2'}>
      <ul className={'grid grid-cols-3 gap-2'}>
        {figures.map(({ label, value, hint }) => (
          <li
            key={label}
            title={hint}
            className={'flex flex-col gap-0.5 rounded-md border border-line bg-secondary p-3'}
          >
            <span className={'text-2xs text-ink-subtle'}>{label}</span>
            <span className={'numeric text-sm font-semibold text-ink'}>{value}</span>
          </li>
        ))}
      </ul>
      {/* Tiny by design, and worth saying so: a total exposure under a percent
          is the rule behaving, not the rule failing to find anything. */}
      <p className={'text-xs text-ink-subtle'}>
        Total exposure <span className={'numeric'}>{formatFraction(bets.total_exposure)}</span> of a
        bankroll.
      </p>
    </div>
  )
}

/**
 * One pick. Every price it carries is shown, because only the first is one
 * anybody can take and the rest are the evidence for whether taking it is worth
 * anything.
 */
function Pick({ pick }: { pick: BetPick }) {
  const competition = fixtureCompetition(pick)
  // A pick carries no `date_confirmed` of its own, but a `commence_time` is only
  // ever set once a real instant exists — so its presence is the same signal.
  const kickoff = describeKickoffLong({
    commence_time: pick.commence_time,
    date_confirmed: pick.commence_time !== null,
    match_date: pick.match_date,
  })

  const prices = [
    { label: 'Best price', value: pick.odds, strong: true },
    { label: 'Benchmark', value: pick.reference_odds, strong: false },
    { label: 'Consensus', value: pick.consensus_odds, strong: false },
    { label: 'Fair', value: pick.fair_odds, strong: false },
  ]

  return (
    <li className={'flex flex-col gap-3 rounded-lg border border-primary/40 bg-card p-4'}>
      <div className={'flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted'}>
        <span className={'truncate'}>{competition.short}</span>
        <time dateTime={kickoff.dateTime} className={'numeric'}>
          {kickoff.text}
        </time>
      </div>

      <div className={'flex flex-wrap items-center justify-between gap-3'}>
        <ul className={'flex min-w-0 flex-col gap-2'}>
          {[
            { name: pick.home_team, crest: pick.home_crest_url },
            { name: pick.away_team, crest: pick.away_crest_url },
          ].map((team) => (
            <li key={team.name} className={'flex min-w-0 items-center gap-2'}>
              <TeamCrest name={team.name} url={team.crest} dense={true} />
              <span className={'text-sm font-medium text-ink'} title={team.name}>
                {displayName(team.name)}
              </span>
            </li>
          ))}
        </ul>

        <div
          className={
            'flex shrink-0 flex-col items-end gap-0.5 rounded-md border border-primary/40 bg-primary/10 px-3 py-2'
          }
        >
          {/* "Value pick", never "model pick": this comes from a price
              disagreement, not from the model out-predicting the market. */}
          <span className={'eyebrow text-primary'}>Value pick</span>
          <span className={'text-sm font-semibold text-ink'}>
            {pick.description ?? pick.selection}
          </span>
          <span className={'numeric text-xs text-ink-muted'}>
            {formatFraction(pick.stake_fraction)} stake
          </span>
        </div>
      </div>

      <ul className={'grid grid-cols-2 gap-2 sm:grid-cols-4'}>
        {prices.map(({ label, value, strong }) => (
          <li key={label} className={'flex flex-col gap-0.5'}>
            <span className={'text-2xs text-ink-subtle'}>{label}</span>
            <span
              className={`numeric text-sm ${strong ? 'font-semibold text-ink' : 'text-ink-muted'}`}
            >
              {formatDecimal(value)}
            </span>
          </li>
        ))}
      </ul>

      <div className={'flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-ink-subtle'}>
        <span>
          Model <span className={'numeric text-ink-muted'}>{formatFraction(pick.p_model)}</span> vs
          market <span className={'numeric text-ink-muted'}>{formatFraction(pick.q_fair)}</span>
        </span>
        <span>
          Rule edge{' '}
          <span className={'numeric text-primary'}>{formatSignedFraction(pick.rule_edge)}</span>
        </span>
        {pick.grade !== null && <span>Grade {pick.grade}</span>}
      </div>
    </li>
  )
}

/**
 * A day with nothing on it, which is the common case: at most three picks a day
 * across every competition, and most days none.
 *
 * The API says why in prose and again as a structured cause. The most frequent
 * is `fixtures_today_carry_no_price` — there are matches today, the feed simply
 * has not published their block yet. None of that is an error, and none of it
 * should read as one.
 */
function EmptyDay({ bets }: { bets: BetsToday }) {
  const cause = asText(bets.empty_because?.cause)

  return (
    <div className={'flex flex-col gap-4'}>
      <div className={'flex flex-col gap-2 rounded-lg border border-line bg-card px-4 py-5'}>
        <p className={'text-sm text-ink'}>{bets.reason ?? 'No picks today.'}</p>
        {cause !== null && <p className={'text-xs text-ink-subtle'}>{humanise(cause)}</p>}
        {/* Which limit stopped more being taken — the reader's next question
            once they know today produced nothing. */}
        {bets.binding_constraint !== null && (
          <p className={'text-xs text-ink-subtle'}>
            Limited by {humanise(bets.binding_constraint).toLowerCase()}.
          </p>
        )}
      </div>

      {/* The counts still matter on an empty day: they are the difference
          between "nothing was worth backing" and "nothing was looked at". */}
      {bets.assessed > 0 && <Context bets={bets} />}
    </div>
  )
}

function BetsPage() {
  useDocumentTitle("Today's picks")
  const { bets, loading, error } = useBetsToday()

  const paywalled = isPaymentRequired(error)

  const rule = [
    asText(bets?.selection_rule?.reference) !== null &&
      `benchmark ${asText(bets?.selection_rule?.reference)}`,
    asFigure(bets?.selection_rule?.threshold) !== null &&
      `threshold ${asFigure(bets?.selection_rule?.threshold)}`,
    asFigure(bets?.selection_rule?.max_per_day) !== null &&
      `at most ${asFigure(bets?.selection_rule?.max_per_day)} a day`,
  ].filter((entry): entry is string => typeof entry === 'string')

  return (
    <div className={'measure flex flex-col gap-6 pt-10 pb-24'}>
      <header className={'flex flex-col gap-2'}>
        <h1 className={'text-xl font-semibold text-ink'}>Today&apos;s picks</h1>
        <p className={'max-w-2xl text-sm text-ink-muted'}>
          StatPitch&apos;s own selections, taken where a bookmaker&apos;s price disagrees with the
          benchmark. Most days there are none.
        </p>
      </header>

      {loading && <div className={'h-48 animate-pulse rounded-lg bg-secondary'} />}

      {paywalled && (
        <Upsell
          title={"Today's picks are part of Pro."}
          detail={
            'The selections StatPitch stakes, the four prices behind each one, and the rule that chose them.'
          }
        />
      )}

      {!loading && !paywalled && error !== null && <QueryError error={error} />}

      {!loading && bets !== null && (
        <>
          {/* Above the picks, never below: a pick read without it claims more
              than the evidence supports. */}
          {bets.bets.length > 0 && bets.caveat !== null && <Caveat text={bets.caveat} />}

          {bets.bets.length === 0 ? (
            <EmptyDay bets={bets} />
          ) : (
            <>
              <ul className={'flex flex-col gap-4'}>
                {bets.bets.map((pick) => (
                  <Pick key={`${pick.fixture_id}-${pick.selection}`} pick={pick} />
                ))}
              </ul>
              <Context bets={bets} />
            </>
          )}

          <footer className={'flex flex-col gap-2 border-t border-line pt-4'}>
            {bets.disclaimer !== null && (
              <p className={'text-xs text-ink-subtle'}>{bets.disclaimer}</p>
            )}
            {bets.selection_rule_status !== null && (
              <p className={'text-2xs text-ink-subtle'}>
                Selection rule: {bets.selection_rule_status}
                {bets.config_status !== null && ` · config ${bets.config_status}`}
                {bets.model_version !== null && ` · model ${bets.model_version}`}
              </p>
            )}
            {/* The rule's own parameters. An untyped object on the wire, so each
                field is read for what it is rather than trusted to be there. */}
            {rule.length > 0 && <p className={'text-2xs text-ink-subtle'}>{rule.join(' · ')}</p>}
            <p className={'text-xs text-ink-subtle'}>
              Settled results for every pick live on the{' '}
              <Link to={'/track-record'}>track record</Link>.
            </p>
          </footer>
        </>
      )}
    </div>
  )
}

export default BetsPage
