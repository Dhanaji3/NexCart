import { ref } from 'vue'
import { http } from './http'
import type { Order, Address } from 'shared'

export interface CheckoutPayload {
  shippingAddress: Address
  paymentMethod: string
  items?: { productId: number; quantity: number }[]
}

export function useCheckoutApi() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function createOrder(payload: CheckoutPayload): Promise<Order | null> {
    loading.value = true
    error.value = null
    try {
      const { data } = await http.post<Order>('/api/orders', payload)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to place order'
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, createOrder }
}
