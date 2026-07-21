<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from 'shared'
import type { Product } from 'shared'
import { useProductsApi } from '../composables'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const { getAll, getById } = useProductsApi()

const product = ref<Product | null>(null)
const relatedProducts = ref<Product[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchProduct() {
  loading.value = true
  error.value = null
  try {
    const id = Number(route.params.id)
    product.value = await getById(id)

    // Fetch related products (same category)
    if (product.value) {
      const response = await getAll({ category: product.value.category, limit: 4 })
      relatedProducts.value = response.products
        .filter(p => p.id !== product.value!.id)
        .slice(0, 3)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to load product'
  } finally {
    loading.value = false
  }
}

onMounted(fetchProduct)

// Re-fetch when route params change (navigating between products)
watch(() => route.params.id, () => {
  if (route.params.id) fetchProduct()
})

function addToCart() {
  if (product.value) {
    cart.addToCart(product.value)
  }
}

function toggleWishlist() {
  if (!product.value) return
  if (cart.isInWishlist(product.value.id)) {
    cart.removeFromWishlist(product.value.id)
  } else {
    cart.addToWishlist(product.value)
  }
}

function buyNow() {
  if (product.value) {
    cart.addToCart(product.value)
    router.push('/checkout')
  }
}
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-slate-500">
    <div class="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
    <p class="mt-4 text-sm">Loading product...</p>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="flex flex-col items-center justify-center py-20 text-center">
    <p class="text-danger-600 mb-4">{{ error }}</p>
    <button @click="fetchProduct()" class="btn-primary">Retry</button>
  </div>

  <div v-else-if="product" class="py-4">
    <button @click="router.back()" class="btn-ghost mb-6">← Back to Products</button>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      <!-- Image -->
      <div>
        <img :src="product.image" :alt="product.name" class="w-full rounded-xl object-cover max-h-[500px] shadow-lg" />
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-4">
        <span class="badge bg-primary-100 text-primary-700">{{ product.category }}</span>
        <h1 class="text-3xl font-bold text-slate-900">{{ product.name }}</h1>

        <div class="flex items-center gap-2 text-sm">
          <span class="font-medium text-slate-800">⭐ {{ product.rating }}</span>
          <span class="text-slate-500">({{ product.reviews }} reviews)</span>
          <span class="text-slate-400 text-xs">SKU: {{ product.sku }}</span>
        </div>

        <div class="text-3xl font-bold text-slate-900">${{ product.price.toFixed(2) }}</div>

        <p class="text-slate-600 leading-relaxed">{{ product.description }}</p>

        <span
          class="badge self-start"
          :class="product.inStock ? 'bg-accent-100 text-accent-700' : 'bg-danger-100 text-danger-700'"
        >
          {{ product.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
        </span>

        <div class="flex gap-3 flex-wrap">
          <button @click="addToCart" :disabled="!product.inStock" class="btn-accent">
            {{ cart.isInCart(product.id) ? '✓ Added to Cart' : 'Add to Cart' }}
          </button>
          <button @click="buyNow" :disabled="!product.inStock" class="btn-primary">
            Buy Now
          </button>
          <button @click="toggleWishlist" class="btn-outline">
            {{ cart.isInWishlist(product.id) ? '❤️ In Wishlist' : '🤍 Add to Wishlist' }}
          </button>
        </div>

        <div class="flex flex-col gap-2 mt-2">
          <span class="text-sm text-slate-500">🚚 Free shipping over $50</span>
          <span class="text-sm text-slate-500">↩️ 30-day easy returns</span>
          <span class="text-sm text-slate-500">🔒 Secure checkout</span>
        </div>
      </div>
    </div>

    <!-- Related Products -->
    <div v-if="relatedProducts.length" class="mt-8">
      <h3 class="text-lg font-semibold text-slate-900 mb-4">Related Products</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <RouterLink
          v-for="rp in relatedProducts"
          :key="rp.id"
          :to="`/products/${rp.id}`"
          class="card p-0 overflow-hidden hover:-translate-y-1 transition-transform no-underline"
        >
          <img :src="rp.image" :alt="rp.name" class="w-full h-36 object-cover" />
          <div class="p-3 flex flex-col gap-1">
            <span class="text-sm text-slate-700 truncate">{{ rp.name }}</span>
            <span class="font-bold text-accent-600">${{ rp.price.toFixed(2) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <h2 class="text-xl font-semibold text-slate-700 mb-2">Product not found</h2>
    <RouterLink to="/products" class="text-primary-600 hover:text-primary-700 font-medium">Browse all products</RouterLink>
  </div>
</template>
