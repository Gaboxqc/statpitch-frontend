import { describe, expect, it } from 'vitest'
import { displayName } from './teamName'

describe('displayName', () => {
  it('takes the club type off either end', () => {
    expect(displayName('Club Atlético de Madrid')).toBe('Atlético de Madrid')
    expect(displayName('Málaga CF')).toBe('Málaga')
    expect(displayName('RCD Espanyol de Barcelona')).toBe('Espanyol de Barcelona')
    expect(displayName('Arsenal FC')).toBe('Arsenal')
  })

  // The interior is load-bearing: a "de" in the middle is part of the name.
  it('never touches the middle of a name', () => {
    expect(displayName('Rayo Vallecano de Madrid')).toBe('Rayo Vallecano de Madrid')
    expect(displayName('Deportivo Alavés')).toBe('Deportivo Alavés')
  })

  it('strips a stacked prefix', () => {
    expect(displayName('AC Sparta Praha')).toBe('Sparta Praha')
  })

  // Whatever is left has to still be a name.
  it('keeps a name that is nothing but boilerplate', () => {
    expect(displayName('FC')).toBe('FC')
    expect(displayName('')).toBe('')
  })
})
