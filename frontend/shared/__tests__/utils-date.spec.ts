import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  formatDate,
  formatShortDate,
  formatRelativeTime,
  formatDateTime,
  isToday,
} from '../src/utils/date'

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2024-01-15T10:30:00Z')
      expect(result).toContain('January')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('formatShortDate', () => {
    it('formats in short format', () => {
      const result = formatShortDate('2024-06-20T00:00:00Z')
      expect(result).toContain('Jun')
      expect(result).toContain('20')
      expect(result).toContain('2024')
    })
  })

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "just now" for recent timestamps', () => {
      expect(formatRelativeTime('2024-06-15T11:59:50Z')).toBe('just now')
    })

    it('returns minutes ago', () => {
      expect(formatRelativeTime('2024-06-15T11:55:00Z')).toBe('5 minutes ago')
    })

    it('returns singular minute', () => {
      expect(formatRelativeTime('2024-06-15T11:59:00Z')).toBe('1 minute ago')
    })

    it('returns hours ago', () => {
      expect(formatRelativeTime('2024-06-15T09:00:00Z')).toBe('3 hours ago')
    })

    it('returns days ago', () => {
      expect(formatRelativeTime('2024-06-12T12:00:00Z')).toBe('3 days ago')
    })

    it('returns weeks ago', () => {
      expect(formatRelativeTime('2024-05-25T12:00:00Z')).toBe('3 weeks ago')
    })
  })

  describe('formatDateTime', () => {
    it('includes date and time', () => {
      const result = formatDateTime('2024-01-15T15:45:00Z')
      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2024')
    })
  })

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date().toISOString())).toBe(true)
    })

    it('returns false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday.toISOString())).toBe(false)
    })
  })
})
