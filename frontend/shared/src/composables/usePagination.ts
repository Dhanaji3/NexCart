import { ref, computed } from 'vue'

export interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
  total?: number
}

/**
 * Composable for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialLimit = 12 } = options

  const page = ref(initialPage)
  const limit = ref(initialLimit)
  const total = ref(options.total || 0)

  const totalPages = computed(() => Math.ceil(total.value / limit.value) || 1)
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPrevPage = computed(() => page.value > 1)
  const offset = computed(() => (page.value - 1) * limit.value)

  const pageRange = computed(() => {
    const range: number[] = []
    const maxVisible = 5
    let start = Math.max(1, page.value - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages.value, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  })

  function nextPage() {
    if (hasNextPage.value) page.value++
  }

  function prevPage() {
    if (hasPrevPage.value) page.value--
  }

  function goToPage(p: number) {
    if (p >= 1 && p <= totalPages.value) page.value = p
  }

  function setTotal(newTotal: number) {
    total.value = newTotal
  }

  function reset() {
    page.value = initialPage
  }

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset,
    pageRange,
    nextPage,
    prevPage,
    goToPage,
    setTotal,
    reset,
  }
}
