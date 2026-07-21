import { computed } from 'vue'
import { useCartStore } from '../stores/cart'
import type { Product } from '../types'
import { formatCurrency } from '../utils/currency'

/**
 * Composable wrapping cart store with additional computed properties and helpers
 */
export function useCart() {
  const store = useCartStore()

  const formattedSubtotal = computed(() => formatCurrency(store.totalPrice))
  const formattedShipping = computed(() =>
    store.shipping === 0 ? 'Free' : formatCurrency(store.shipping)
  )
  const formattedGrandTotal = computed(() => formatCurrency(store.grandTotal))
  const isEmpty = computed(() => store.items.length === 0)
  const freeShippingThreshold = 50
  const amountToFreeShipping = computed(() =>
    Math.max(0, freeShippingThreshold - store.totalPrice)
  )
  const hasFreeShipping = computed(() => store.totalPrice >= freeShippingThreshold)

  function addItem(product: Product, quantity = 1) {
    return store.addToCart(product, quantity)
  }

  function removeItem(productId: number) {
    return store.removeFromCart(productId)
  }

  function updateItemQuantity(productId: number, quantity: number) {
    return store.updateQuantity(productId, quantity)
  }

  function clearAll() {
    return store.clearCart()
  }

  function toggleWishlist(product: Product) {
    if (store.isInWishlist(product.id)) {
      store.removeFromWishlist(product.id)
    } else {
      store.addToWishlist(product)
    }
  }

  return {
    items: computed(() => store.items),
    wishlist: computed(() => store.wishlist),
    totalItems: computed(() => store.totalItems),
    subtotal: computed(() => store.totalPrice),
    shipping: computed(() => store.shipping),
    grandTotal: computed(() => store.grandTotal),
    loading: computed(() => store.loading),
    error: computed(() => store.error),
    isEmpty,
    formattedSubtotal,
    formattedShipping,
    formattedGrandTotal,
    amountToFreeShipping,
    hasFreeShipping,
    addItem,
    removeItem,
    updateItemQuantity,
    clearAll,
    toggleWishlist,
    isInCart: store.isInCart,
    isInWishlist: store.isInWishlist,
    fetchCart: store.fetchCart,
    fetchWishlist: store.fetchWishlist,
  }
}
