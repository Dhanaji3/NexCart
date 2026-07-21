import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCartStore } from '../src/stores/cart'
import type { Product } from '../src/types'

// Mock the API module
vi.mock('../src/api', () => ({
  cartApi: {
    get: vi.fn().mockResolvedValue([]),
    addItem: vi.fn().mockResolvedValue([]),
    updateQuantity: vi.fn().mockResolvedValue([]),
    removeItem: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  },
  wishlistApi: {
    get: vi.fn().mockResolvedValue([]),
    add: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(undefined),
  },
}))

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  price: 29.99,
  description: 'Test description',
  image: 'https://example.com/img.jpg',
  category: 'electronics',
  rating: 4.5,
  reviews: 10,
  inStock: true,
  sku: 'TEST-001',
}

const mockProduct2: Product = {
  id: 2,
  name: 'Second Product',
  price: 49.99,
  description: 'Another product',
  image: 'https://example.com/img2.jpg',
  category: 'clothing',
  rating: 4.0,
  reviews: 5,
  inStock: true,
  sku: 'TEST-002',
}

describe('Cart Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('starts with empty cart', () => {
    const cart = useCartStore()
    expect(cart.items).toHaveLength(0)
    expect(cart.totalItems).toBe(0)
    expect(cart.totalPrice).toBe(0)
  })

  it('adds item to cart', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].product.id).toBe(1)
    expect(cart.items[0].quantity).toBe(1)
  })

  it('increments quantity when adding same item', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.addToCart(mockProduct)

    expect(cart.items).toHaveLength(1)
    expect(cart.items[0].quantity).toBe(2)
  })

  it('removes item from cart', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.removeFromCart(1)

    expect(cart.items).toHaveLength(0)
  })

  it('updates item quantity', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.updateQuantity(1, 5)

    expect(cart.items[0].quantity).toBe(5)
  })

  it('removes item when quantity set to 0', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.updateQuantity(1, 0)

    expect(cart.items).toHaveLength(0)
  })

  it('calculates total price correctly', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.updateQuantity(1, 3)

    expect(cart.totalPrice).toBeCloseTo(89.97)
  })

  it('provides free shipping over $50', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.updateQuantity(1, 2) // 59.98

    expect(cart.shipping).toBe(0)
  })

  it('charges shipping under $50', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct) // 29.99

    expect(cart.shipping).toBe(9.99)
  })

  it('calculates grand total correctly', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct) // 29.99 + 9.99 shipping

    expect(cart.grandTotal).toBeCloseTo(39.98)
  })

  it('clears entire cart', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)
    await cart.addToCart(mockProduct2)
    await cart.clearCart()

    expect(cart.items).toHaveLength(0)
    expect(cart.totalItems).toBe(0)
  })

  it('checks if item is in cart', async () => {
    const cart = useCartStore()
    await cart.addToCart(mockProduct)

    expect(cart.isInCart(1)).toBe(true)
    expect(cart.isInCart(999)).toBe(false)
  })

  it('manages wishlist - add', async () => {
    const cart = useCartStore()
    await cart.addToWishlist(mockProduct)

    expect(cart.wishlist).toHaveLength(1)
    expect(cart.isInWishlist(1)).toBe(true)
  })

  it('manages wishlist - remove', async () => {
    const cart = useCartStore()
    await cart.addToWishlist(mockProduct)
    await cart.removeFromWishlist(1)

    expect(cart.wishlist).toHaveLength(0)
    expect(cart.isInWishlist(1)).toBe(false)
  })

  it('does not add duplicate to wishlist', async () => {
    const cart = useCartStore()
    await cart.addToWishlist(mockProduct)
    await cart.addToWishlist(mockProduct)

    expect(cart.wishlist).toHaveLength(1)
  })
})
