import { describe, expect, it } from 'vitest'
import {
  formatCount,
  formatDecimal,
  formatFraction,
  formatPercent,
  formatSignedFraction,
  formatSignedPercent,
  shortModelVersion,
  toPercentValue,
} from './format'

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

describe('formatSignedFraction', () => {
  // Regression: EV was rendered with formatPercent, so a +6.17% edge showed as "0.06%".
  it('scales an EV fraction to a percentage', () => {
    expect(formatSignedFraction(0.0617)).toBe('+6.17%')
    expect(formatSignedFraction(-0.0562)).toBe('-5.62%')
  })

  it('marks a zero edge as non-negative rather than dropping the sign', () => {
    expect(formatSignedFraction(0)).toBe('+0.00%')
  })

  it('renders a placeholder for an unquoted market', () => {
    expect(formatSignedFraction(null)).toBe('—')
  })
})

describe('formatSignedPercent', () => {
  // roi_pct is the one rate the API sends already scaled.
  it('treats the value as already scaled', () => {
    expect(formatSignedPercent(45, 1)).toBe('+45.0%')
    expect(formatSignedPercent(-11.25, 1)).toBe('-11.3%')
  })

  it('distinguishes an unmeasured window from a break-even one', () => {
    expect(formatSignedPercent(null)).toBe('—')
    expect(formatSignedPercent(0)).toBe('+0.00%')
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

describe('shortModelVersion', () => {
  it('drops the commit hash and keeps the family and fit date', () => {
    expect(shortModelVersion('goals-20260813-bb07c99e')).toBe('goals-20260813')
  })

  it('leaves a version that carries no hash alone', () => {
    expect(shortModelVersion('goals-20260813')).toBe('goals-20260813')
    expect(shortModelVersion('baseline')).toBe('baseline')
  })

  it('does not invent a version from an empty payload', () => {
    expect(shortModelVersion(null)).toBe('—')
    expect(shortModelVersion('')).toBe('—')
  })
})
