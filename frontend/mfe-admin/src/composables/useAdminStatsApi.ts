import { ref } from 'vue'
import { http } from './http'
import type { AdminStats } from 'shared'

export function useAdminStatsApi() {
  const stats = ref<AdminStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    loading.value = true
    error.value = null
    try {
      const { data } = await http.get<AdminStats>('/api/admin/stats')
      stats.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to load dashboard stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  return { stats, loading, error, fetchStats }
}
