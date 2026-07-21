import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOrdersStore } from '../src/stores/orders'

vi.mock('../src/api', () => ({
  ordersApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

import { ordersApi } from '../src/api'

const mockOrders = [
  {
    id: 'ORD-001',
    items: [{ product: { id: 1, name: 'Product', price: 29.99, description: '', image: '', category: 'electronics', rating: 4.5, reviews: 10, inStock: true, sku: 'A-001' }, quantity: 2 }],
    total: 59.98,
    status: 'pending' as const,
    createdAt: '2024-01-15T10:30:00Z',
    shippingAddress: { fullName: 'John Doe', street: '123 Main St', city: 'NYC', state: 'NY', zipCode: '10001', country: 'US', phone: '555-1234' },
    paymentMethod: 'credit_card',
  },
  {
    id: 'ORD-002',
    items: [{ product: { id: 2, name: 'Product B', price: 49.99, description: '', image: '', category: 'clothing', rating: 4.0, reviews: 5, inStock: true, sku: 'B-001' }, quantity: 1 }],
    total: 49.99,
    status: 'shipped' as const,
    createdAt: '2024-01-10T08:00:00Z',
    shippingAddress: { fullName: 'Jane Smith', street: '456 Oak Ave', city: 'LA', state: 'CA', zipCode: '90001', country: 'US', phone: '555-5678' },
    paymentMethod: 'paypal',
    trackingNumber: 'TRACK-123',
  },
]

describe('Orders Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts with empty orders', () => {
    const store = useOrdersStore()
    expect(store.orders).toHaveLength(0)
    expect(store.orderCount).toBe(0)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches orders successfully', async () => {
    vi.mocked(ordersApi.getAll).mockResolvedValue(mockOrders)

    const store = useOrdersStore()
    await store.fetchOrders()

    expect(store.orders).toHaveLength(2)
    expect(store.orderCount).toBe(2)
  })

  it('fetches orders by status', async () => {
    vi.mocked(ordersApi.getAll).mockResolvedValue([mockOrders[0]])

    const store = useOrdersStore()
    await store.fetchOrders('pending')

    expect(ordersApi.getAll).toHaveBeenCalledWith('pending')
    expect(store.orders).toHaveLength(1)
  })

  it('handles fetch error', async () => {
    vi.mocked(ordersApi.getAll).mockRejectedValue({ message: 'Unauthorized' })

    const store = useOrdersStore()
    await store.fetchOrders()

    expect(store.error).toBe('Unauthorized')
  })

  it('fetches single order by id', async () => {
    vi.mocked(ordersApi.getById).mockResolvedValue(mockOrders[0])

    const store = useOrdersStore()
    const order = await store.fetchOrderById('ORD-001')

    expect(order).not.toBeNull()
    expect(order!.id).toBe('ORD-001')
    expect(store.currentOrder?.id).toBe('ORD-001')
  })

  it('creates a new order', async () => {
    const newOrder = { ...mockOrders[0], id: 'ORD-003' }
    vi.mocked(ordersApi.create).mockResolvedValue(newOrder)

    const store = useOrdersStore()
    const result = await store.createOrder({
      shippingAddress: mockOrders[0].shippingAddress,
      paymentMethod: 'credit_card',
    })

    expect(result).not.toBeNull()
    expect(result!.id).toBe('ORD-003')
    expect(store.orders[0].id).toBe('ORD-003')
    expect(store.currentOrder?.id).toBe('ORD-003')
  })

  it('updates order status', async () => {
    const updated = { ...mockOrders[0], status: 'shipped' as const, trackingNumber: 'TRK-999' }
    vi.mocked(ordersApi.getAll).mockResolvedValue(mockOrders)
    vi.mocked(ordersApi.updateStatus).mockResolvedValue(updated)

    const store = useOrdersStore()
    await store.fetchOrders()
    const result = await store.updateStatus('ORD-001', 'shipped', 'TRK-999')

    expect(result).toBe(true)
    expect(store.orders[0].status).toBe('shipped')
    expect(store.orders[0].trackingNumber).toBe('TRK-999')
  })

  it('filters orders by status', async () => {
    vi.mocked(ordersApi.getAll).mockResolvedValue(mockOrders)

    const store = useOrdersStore()
    await store.fetchOrders()

    store.statusFilter = 'pending'
    expect(store.filteredOrders).toHaveLength(1)
    expect(store.filteredOrders[0].id).toBe('ORD-001')

    store.statusFilter = 'shipped'
    expect(store.filteredOrders).toHaveLength(1)
    expect(store.filteredOrders[0].id).toBe('ORD-002')

    store.statusFilter = ''
    expect(store.filteredOrders).toHaveLength(2)
  })

  it('counts pending orders', async () => {
    vi.mocked(ordersApi.getAll).mockResolvedValue(mockOrders)

    const store = useOrdersStore()
    await store.fetchOrders()

    expect(store.pendingOrders).toBe(1)
  })

  it('handles update status failure', async () => {
    vi.mocked(ordersApi.getAll).mockResolvedValue(mockOrders)
    vi.mocked(ordersApi.updateStatus).mockRejectedValue({ message: 'Forbidden' })

    const store = useOrdersStore()
    await store.fetchOrders()
    const result = await store.updateStatus('ORD-001', 'shipped')

    expect(result).toBe(false)
    expect(store.error).toBe('Forbidden')
    expect(store.orders[0].status).toBe('pending') // Unchanged
  })
})
