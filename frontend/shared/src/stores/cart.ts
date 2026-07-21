import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Product } from '../types'
import { cartApi, wishlistApi } from '../api'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const wishlist = ref<Product[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  )

  const shipping = computed(() => (totalPrice.value > 50 ? 0 : 9.99))

  const grandTotal = computed(() => totalPrice.value + shipping.value)

  async function fetchCart() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      loading.value = true
      const cartItems = await cartApi.get()
      items.value = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
      }))
    } catch {
      // Silently fail - user may not be logged in
    } finally {
      loading.value = false
    }
  }

  async function addToCart(product: Product, quantity = 1) {
    const existing = items.value.find((item) => item.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({ product, quantity })
    }

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await cartApi.addItem(product.id, quantity)
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  async function removeFromCart(productId: number) {
    items.value = items.value.filter((item) => item.product.id !== productId)

    try {
      const token = localStorage.getItem('token')
      if (token) {
        await cartApi.removeItem(productId)
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  async function updateQuantity(productId: number, quantity: number) {
    const item = items.value.find((item) => item.product.id === productId)
    if (item) {
      if (quantity <= 0) {
        await removeFromCart(productId)
      } else {
        item.quantity = quantity
        try {
          const token = localStorage.getItem('token')
          if (token) {
            await cartApi.updateQuantity(productId, quantity)
          }
        } catch (err: any) {
          error.value = err.message
        }
      }
    }
  }

  async function clearCart() {
    items.value = []
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await cartApi.clear()
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  async function fetchWishlist() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const products = await wishlistApi.get()
      wishlist.value = products
    } catch {
      // Silently fail
    }
  }

  async function addToWishlist(product: Product) {
    if (!wishlist.value.find((p) => p.id === product.id)) {
      wishlist.value.push(product)
      try {
        const token = localStorage.getItem('token')
        if (token) {
          await wishlistApi.add(product.id)
        }
      } catch (err: any) {
        error.value = err.message
      }
    }
  }

  async function removeFromWishlist(productId: number) {
    wishlist.value = wishlist.value.filter((p) => p.id !== productId)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await wishlistApi.remove(productId)
      }
    } catch (err: any) {
      error.value = err.message
    }
  }

  function isInWishlist(productId: number) {
    return wishlist.value.some((p) => p.id === productId)
  }

  function isInCart(productId: number) {
    return items.value.some((item) => item.product.id === productId)
  }

  return {
    items,
    wishlist,
    loading,
    error,
    totalItems,
    totalPrice,
    shipping,
    grandTotal,
    fetchCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    isInCart,
  }
})
