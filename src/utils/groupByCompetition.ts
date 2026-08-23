import { fixtureCompetition } from '../constants/competitions'
import type { Fixture } from '../types/api'

export interface CompetitionGroup {
  id: string
  name: string
  short: string
  icon: string | null
  fixtures: Fixture[]
}

/**
 * Breaks an already-ordered list into its competitions.
 *
 * Groups appear in the order their first fixture does, which means the sort
 * applied upstream decides the order here too — there is deliberately no second
 * ordering rule to keep in step with `sortFixtures`. Order within a group is
 * likewise untouched.
 *
 * A competition can only appear once: the list is walked in order and each
 * fixture joins the group already opened for it.
 */
export function groupByCompetition(fixtures: Fixture[]): CompetitionGroup[] {
  const groups = new Map<string, CompetitionGroup>()

  for (const fixture of fixtures) {
    const existing = groups.get(fixture.competition_id)
    if (existing) {
      existing.fixtures.push(fixture)
      continue
    }
    groups.set(fixture.competition_id, { ...fixtureCompetition(fixture), fixtures: [fixture] })
  }

  return [...groups.values()]
}
