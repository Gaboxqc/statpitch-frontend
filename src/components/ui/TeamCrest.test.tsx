import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import TeamCrest from './TeamCrest'
import { crestInitials } from '../../utils/crestInitials'

describe('crestInitials', () => {
  it('skips the boilerplate that says nothing about which club it is', () => {
    expect(crestInitials('Club Atlético de Madrid')).toBe('AM')
    expect(crestInitials('RCD Espanyol de Barcelona')).toBe('EB')
  })

  it('gives a two-letter mark for a single-word name', () => {
    expect(crestInitials('Arsenal FC')).toBe('AR')
    expect(crestInitials('Feyenoord')).toBe('FE')
  })

  it('falls back to the raw words when everything looks like boilerplate', () => {
    expect(crestInitials('FC')).toBe('FC')
  })

  it('does not throw on an empty name', () => {
    expect(crestInitials('')).toBe('?')
  })
})

describe('TeamCrest', () => {
  // The API sends a null crest for every club, so the <img> path is currently
  // unreachable in production and the fallback is what users actually see.
  it('labels the placeholder for screen readers', () => {
    render(<TeamCrest name={'Arsenal FC'} url={null} />)
    expect(screen.getByRole('img', { name: 'Arsenal FC crest' })).toBeInTheDocument()
  })

  it('uses a real image when one is ever supplied', () => {
    render(<TeamCrest name={'Arsenal FC'} url={'https://example.test/arsenal.png'} />)
    expect(screen.getByRole('img', { name: 'Arsenal FC crest' })).toHaveAttribute(
      'src',
      'https://example.test/arsenal.png',
    )
  })
})
