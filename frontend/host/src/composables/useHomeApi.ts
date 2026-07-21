import { ref } from 'vue'
import { http } from './http'
import type { Product, Category } from 'shared'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export function useHomeApi() {
  const featuredProducts = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchHome() {
    loading.value = true
    error.value = null
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        http.get<ProductsResponse>('/api/products', { params: { limit: 8 } }),
        http.get<Category[]>('/api/categories'),
      ])
      featuredProducts.value = productsRes.data.products
      categories.value = categoriesRes.data
    } catch (err: any) {
      error.value = err.message || 'Failed to load home data'
    } finally {
      loading.value = false
    }
  }

  return { featuredProducts, categories, loading, error, fetchHome }
}
