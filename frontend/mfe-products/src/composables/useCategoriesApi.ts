import { ref } from 'vue'
import { http } from './http'
import type { Category } from 'shared'

export function useCategoriesApi() {
  const categories = ref<Category[]>([])
  const loading = ref(false)

  async function getAll() {
    loading.value = true
    try {
      const { data } = await http.get<Category[]>('/api/categories')
      categories.value = data
      return data
    } catch {
      // Categories are non-critical
      return []
    } finally {
      loading.value = false
    }
  }

  return { categories, loading, getAll }
}
