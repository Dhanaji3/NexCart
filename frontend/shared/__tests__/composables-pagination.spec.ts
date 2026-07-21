import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePagination } from '../src/composables/usePagination'

describe('usePagination Composable', () => {
  it('initializes with default values', () => {
    const { page, limit, total, totalPages } = usePagination()

    expect(page.value).toBe(1)
    expect(limit.value).toBe(12)
    expect(total.value).toBe(0)
    expect(totalPages.value).toBe(1)
  })

  it('accepts initial options', () => {
    const { page, limit, total } = usePagination({
      initialPage: 2,
      initialLimit: 20,
      total: 100,
    })

    expect(page.value).toBe(2)
    expect(limit.value).toBe(20)
    expect(total.value).toBe(100)
  })

  it('calculates total pages', () => {
    const { totalPages, setTotal } = usePagination({ initialLimit: 10 })
    setTotal(55)

    expect(totalPages.value).toBe(6)
  })

  it('detects next/prev page availability', () => {
    const { hasNextPage, hasPrevPage, page, setTotal } = usePagination({
      initialLimit: 10,
      total: 30,
    })

    setTotal(30)
    expect(hasNextPage.value).toBe(true)
    expect(hasPrevPage.value).toBe(false)

    page.value = 2
    expect(hasNextPage.value).toBe(true)
    expect(hasPrevPage.value).toBe(true)

    page.value = 3
    expect(hasNextPage.value).toBe(false)
    expect(hasPrevPage.value).toBe(true)
  })

  it('navigates pages', () => {
    const { page, nextPage, prevPage, setTotal } = usePagination({ initialLimit: 10 })
    setTotal(30)

    nextPage()
    expect(page.value).toBe(2)

    nextPage()
    expect(page.value).toBe(3)

    nextPage() // Should not go past last page
    expect(page.value).toBe(3)

    prevPage()
    expect(page.value).toBe(2)
  })

  it('prevents going below page 1', () => {
    const { page, prevPage } = usePagination()

    prevPage()
    expect(page.value).toBe(1)
  })

  it('goes to specific page', () => {
    const { page, goToPage, setTotal } = usePagination({ initialLimit: 10 })
    setTotal(50)

    goToPage(3)
    expect(page.value).toBe(3)

    goToPage(0) // Invalid
    expect(page.value).toBe(3)

    goToPage(10) // Beyond total
    expect(page.value).toBe(3)
  })

  it('calculates offset', () => {
    const { offset, page } = usePagination({ initialLimit: 10 })

    expect(offset.value).toBe(0) // page 1

    page.value = 3
    expect(offset.value).toBe(20)
  })

  it('generates page range', () => {
    const { pageRange, page, setTotal } = usePagination({ initialLimit: 10 })
    setTotal(100) // 10 pages

    expect(pageRange.value).toEqual([1, 2, 3, 4, 5])

    page.value = 5
    expect(pageRange.value).toEqual([3, 4, 5, 6, 7])

    page.value = 10
    expect(pageRange.value).toEqual([6, 7, 8, 9, 10])
  })

  it('resets to initial page', () => {
    const { page, reset, setTotal } = usePagination({ initialLimit: 10 })
    setTotal(50)

    page.value = 4
    reset()
    expect(page.value).toBe(1)
  })
})
