import { ref, watch, type Ref } from 'vue'

/**
 * Reactive debounce composable.
 * Returns a debounced ref that updates `delay` ms after the source changes.
 */
export function useDebounce<T>(source: Ref<T>, delay = 300): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, (newValue) => {
    if (timeoutId !== null) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  return debounced
}
