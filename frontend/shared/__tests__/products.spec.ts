import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProductsStore } from '../src/stores/products'

vi.mock('../src/api', () => ({
  productsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  categoriesApi: {
    getAll: vi.fn(),
  },
}))

import { productsApi, categoriesApi } from '../src/api'

const mockProducts = [
  { id: 1, name: 'Product A', price: 29.99, description: '', image: '', category: 'electronics', rating: 4.5, reviews: 10, inStock: true, sku: 'A-001' },
  { id: 2, name: 'Product B', price: 49.99, description: '', image: '', category: 'clothing', rating: 4.0, reviews: 5, inStock: true, sku: 'B-001' },
]

const mockCategories = [
  { id: 1, name: 'Electronics', slug: 'electronics', icon: '💻' },
  { id: 2, name: 'Clothing', slug: 'clothing', icon: '👕' },
]

describe('Products Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts with empty products', () => {
    const store = useProductsStore()
    expect(store.products).toHaveLength(0)
    expect(store.hasProducts).toBe(false)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches products successfully', async () => {
    vi.mocked(productsApi.getAll).mockResolvedValue({
      products: mockProducts,
      total: 2,
      page: 1,
      totalPages: 1,
    })

    const store = useProductsStore()
    await store.fetchProducts()

    expect(store.products).toHaveLength(2)
    expect(store.total).toBe(2)
    expect(store.hasProducts).toBe(true)
    expect(store.loading).toBe(false)
  })

  it('handles fetch error', async () => {
    vi.mocked(productsApi.getAll).mockRejectedValue({ message: 'Network error' })

    const store = useProductsStore()
    await store.fetchProducts()

    expect(store.error).toBe('Network error')
    expect(store.products).toHaveLength(0)
  })

  it('fetches categories', async () => {
    vi.mocked(categoriesApi.getAll).mockResolvedValue(mockCategories)

    const store = useProductsStore()
    await store.fetchCategories()

    expect(store.categories).toHaveLength(2)
    expect(store.categories[0].slug).toBe('electronics')
  })

  it('fetches single product by id', async () => {
    vi.mocked(productsApi.getById).mockResolvedValue(mockProducts[0])

    const store = useProductsStore()
    const product = await store.fetchProductById(1)

    expect(product).not.toBeNull()
    expect(product!.name).toBe('Product A')
    expect(store.selectedProduct?.id).toBe(1)
  })

  it('creates a new product', async () => {
    const newProduct = { ...mockProducts[0], id: 3, name: 'Product C' }
    vi.mocked(productsApi.create).mockResolvedValue(newProduct)

    const store = useProductsStore()
    const result = await store.createProduct({ name: 'Product C', price: 19.99, description: '', image: '', category: 'electronics', rating: 0, reviews: 0, inStock: true, sku: 'C-001' })

    expect(result).not.toBeNull()
    expect(store.products[0].name).toBe('Product C')
    expect(store.total).toBe(1)
  })

  it('updates a product', async () => {
    vi.mocked(productsApi.getAll).mockResolvedValue({ products: mockProducts, total: 2, page: 1, totalPages: 1 })
    const updated = { ...mockProducts[0], name: 'Updated Product A' }
    vi.mocked(productsApi.update).mockResolvedValue(updated)

    const store = useProductsStore()
    await store.fetchProducts()
    const result = await store.updateProduct(1, { name: 'Updated Product A' })

    expect(result!.name).toBe('Updated Product A')
    expect(store.products[0].name).toBe('Updated Product A')
  })

  it('deletes a product', async () => {
    vi.mocked(productsApi.getAll).mockResolvedValue({ products: mockProducts, total: 2, page: 1, totalPages: 1 })
    vi.mocked(productsApi.delete).mockResolvedValue(undefined)

    const store = useProductsStore()
    await store.fetchProducts()
    const result = await store.deleteProduct(1)

    expect(result).toBe(true)
    expect(store.products).toHaveLength(1)
    expect(store.total).toBe(1)
  })

  it('resets filters', () => {
    const store = useProductsStore()
    store.searchQuery = 'test'
    store.selectedCategory = 'electronics'
    store.sortBy = 'price-asc'
    store.page = 3

    store.resetFilters()

    expect(store.searchQuery).toBe('')
    expect(store.selectedCategory).toBe('')
    expect(store.sortBy).toBe('name')
    expect(store.page).toBe(1)
  })

  it('sets loading state during API calls', async () => {
    let resolveProducts: any
    vi.mocked(productsApi.getAll).mockImplementation(
      () => new Promise((resolve) => { resolveProducts = resolve })
    )

    const store = useProductsStore()
    const promise = store.fetchProducts()

    expect(store.loading).toBe(true)

    resolveProducts({ products: [], total: 0, page: 1, totalPages: 1 })
    await promise

    expect(store.loading).toBe(false)
  })
})
