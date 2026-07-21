import { describe, it, expect } from 'vitest'
import {
  truncate,
  slugify,
  capitalize,
  slugToTitle,
  formatNumber,
  pluralize,
} from '../src/utils/string'

describe('String Utils', () => {
  describe('truncate', () => {
    it('returns string unchanged if shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello')
    })

    it('truncates long strings with ellipsis', () => {
      expect(truncate('This is a very long string', 15)).toBe('This is a ve...')
    })

    it('handles exact length', () => {
      expect(truncate('12345', 5)).toBe('12345')
    })
  })

  describe('slugify', () => {
    it('converts string to slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
    })

    it('removes special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world')
    })

    it('handles multiple spaces', () => {
      expect(slugify('  hello   world  ')).toBe('hello-world')
    })
  })

  describe('capitalize', () => {
    it('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })

    it('returns empty string for empty input', () => {
      expect(capitalize('')).toBe('')
    })

    it('handles single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('slugToTitle', () => {
    it('converts slug to title case', () => {
      expect(slugToTitle('home-garden')).toBe('Home Garden')
    })

    it('handles single word', () => {
      expect(slugToTitle('electronics')).toBe('Electronics')
    })
  })

  describe('formatNumber', () => {
    it('formats with commas', () => {
      expect(formatNumber(1000)).toBe('1,000')
      expect(formatNumber(1000000)).toBe('1,000,000')
    })

    it('handles small numbers', () => {
      expect(formatNumber(42)).toBe('42')
    })
  })

  describe('pluralize', () => {
    it('returns singular for 1', () => {
      expect(pluralize(1, 'item')).toBe('1 item')
    })

    it('returns plural for > 1', () => {
      expect(pluralize(5, 'item')).toBe('5 items')
    })

    it('returns plural for 0', () => {
      expect(pluralize(0, 'item')).toBe('0 items')
    })

    it('accepts custom plural', () => {
      expect(pluralize(2, 'category', 'categories')).toBe('2 categories')
    })
  })
})
