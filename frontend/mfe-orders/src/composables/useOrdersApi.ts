import { ref } from 'vue'
import { http } from './http'
import type { Order } from 'shared'

export function useOrdersApi() {
  const orders = ref<Order[]>([])
  const order = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function getAll(status?: string) {
    loading.value = true
    error.value = null
    try {
      const params = status ? { status } : undefined
      const { data } = await http.get<Order[]>('/api/orders', { params })
      orders.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to load orders'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getById(id: string): Promise<Order | null> {
    loading.value = true
    error.value = null
    try {
      const { data } = await http.get<Order>(`/api/orders/${id}`)
      order.value = data
      return data
    } catch (err: any) {
      error.value = err.message || 'Order not found'
      return null
    } finally {
      loading.value = false
    }
  }

  return { orders, order, loading, error, getAll, getById }
}
