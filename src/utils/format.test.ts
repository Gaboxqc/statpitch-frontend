import { describe, expect, it } from 'vitest'
import { formatCount, formatDecimal, formatFraction, formatPercent, toPercentValue } from './format'

describe('formatFraction', () => {
  // Regression: the old code did `kelly.toFixed(2) * 100`, rounding before scaling.
  it('multiplies before rounding', () => {
    expect(formatFraction(0.0523)).toBe('5.23%')
    expect(formatFraction(0.0049)).toBe('0.49%')
    expect(formatFraction(0.1875)).toBe('18.75%')
  })

  it('renders a placeholder for null rather than "null%"', () => {
    expect(formatFraction(null)).toBe('—')
    expect(formatFraction(undefined)).toBe('—')
  })

  it('keeps a genuine zero', () => {
    expect(formatFraction(0)).toBe('0.00%')
  })
})

describe('formatPercent', () => {
  it('treats the value as already scaled', () => {
    expect(formatPercent(6.42)).toBe('6.42%')
    expect(formatPercent(0)).toBe('0.00%')
  })

  it('honours the decimals argument', () => {
    expect(formatPercent(69.24, 1)).toBe('69.2%')
  })
})

describe('toPercentValue', () => {
  it('scales without floating point noise', () => {
    expect(toPercentValue(0.673)).toBe(67.3)
  })

  it('falls back to zero so chart widths stay valid', () => {
    expect(toPercentValue(null)).toBe(0)
    expect(toPercentValue('nonsense')).toBe(0)
  })
})

describe('formatCount and formatDecimal', () => {
  it('distinguishes zero from missing', () => {
    expect(formatCount(0)).toBe('0')
    expect(formatCount(null)).toBe('—')
  })

  it('does not throw on undefined input', () => {
    expect(formatDecimal(undefined)).toBe('—')
    expect(formatDecimal(1.8734)).toBe('1.87')
  })
})
