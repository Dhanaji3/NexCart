import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { debounce, throttle } from '../src/utils/debounce'

describe('Debounce Utils', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('debounce', () => {
    it('delays function execution', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced()
      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 300)

      debounced()
      vi.advanceTimersByTime(200)
      debounced() // Reset
      vi.advanceTimersByTime(200)

      expect(fn).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('passes arguments to the function', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced('arg1', 'arg2')
      vi.advanceTimersByTime(100)

      expect(fn).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('only calls function once for rapid calls', () => {
      const fn = vi.fn()
      const debounced = debounce(fn, 100)

      debounced()
      debounced()
      debounced()
      debounced()
      debounced()

      vi.advanceTimersByTime(100)
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('throttle', () => {
    it('executes immediately on first call', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 300)

      throttled()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('prevents execution within throttle period', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 300)

      throttled()
      throttled()
      throttled()

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('allows execution after throttle period', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 300)

      throttled()
      vi.advanceTimersByTime(300)
      throttled()

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('passes arguments', () => {
      const fn = vi.fn()
      const throttled = throttle(fn, 100)

      throttled('hello')
      expect(fn).toHaveBeenCalledWith('hello')
    })
  })
})
