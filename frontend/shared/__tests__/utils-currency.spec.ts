import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCompactCurrency,
  calculateDiscount,
  calculateTax,
} from '../src/utils/currency'

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('formats basic price', () => {
      expect(formatCurrency(29.99)).toBe('$29.99')
    })

    it('formats zero', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('formats large numbers with commas', () => {
      expect(formatCurrency(1299.99)).toBe('$1,299.99')
    })

    it('rounds to two decimal places', () => {
      expect(formatCurrency(29.999)).toBe('$30.00')
    })

    it('supports different currencies', () => {
      const result = formatCurrency(29.99, 'EUR', 'de-DE')
      expect(result).toContain('29,99')
    })
  })

  describe('formatCompactCurrency', () => {
    it('formats thousands as K', () => {
      const result = formatCompactCurrency(1500)
      expect(result).toContain('1.5')
      expect(result).toContain('K')
    })

    it('formats millions as M', () => {
      const result = formatCompactCurrency(2500000)
      expect(result).toContain('2.5')
      expect(result).toContain('M')
    })
  })

  describe('calculateDiscount', () => {
    it('calculates percentage discount', () => {
      expect(calculateDiscount(100, 75)).toBe(25)
    })

    it('returns 0 for zero original price', () => {
      expect(calculateDiscount(0, 50)).toBe(0)
    })

    it('rounds to nearest integer', () => {
      expect(calculateDiscount(99.99, 66.66)).toBe(33)
    })
  })

  describe('calculateTax', () => {
    it('calculates 8% tax by default', () => {
      expect(calculateTax(100)).toBe(8)
    })

    it('accepts custom tax rate', () => {
      expect(calculateTax(100, 0.10)).toBe(10)
    })

    it('rounds to 2 decimal places', () => {
      expect(calculateTax(33.33)).toBe(2.67)
    })
  })
})
