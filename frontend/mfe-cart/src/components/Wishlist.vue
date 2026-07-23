<script setup lang="ts">
import { useCartStore } from "shared";

const cart = useCartStore();
</script>

<template>
  <div class="py-4">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-slate-800">My Wishlist</h2>
    </div>

    <div v-if="cart.wishlist.length === 0" class="text-center py-16 card">
      <span class="text-6xl block mb-4">❤️</span>
      <h3 class="text-lg font-semibold text-slate-700 mb-2">
        Your wishlist is empty
      </h3>
      <p class="text-slate-500 mb-6">
        Save your favorite items here for later!
      </p>
      <RouterLink to="/products" class="btn-accent">Browse Products</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in cart.wishlist"
        :key="product.id"
        class="card relative overflow-hidden"
      >
        <button
          @click="cart.removeFromWishlist(product.id)"
          class="btn-ghost text-rose-500 text-sm absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/90"
        >
          ✕
        </button>
        <RouterLink :to="`/products/${product.id}`">
          <img
            :src="product.image"
            :alt="product.name"
            class="w-full h-40 object-cover rounded-lg"
          />
        </RouterLink>
        <div class="p-4">
          <RouterLink
            :to="`/products/${product.id}`"
            class="block font-medium text-slate-700 text-sm mb-1 no-underline hover:text-emerald-600"
          >
            {{ product.name }}
          </RouterLink>
          <div class="text-xl font-bold text-emerald-600 mb-1">
            ₹{{ product.price.toFixed(2) }}
          </div>
          <div
            class="text-xs mb-3"
            :class="product.inStock ? 'text-emerald-600' : 'text-rose-500'"
          >
            {{ product.inStock ? "In Stock" : "Out of Stock" }}
          </div>
          <button
            @click="
              cart.addToCart(product);
              cart.removeFromWishlist(product.id);
            "
            :disabled="!product.inStock"
            class="btn-accent text-sm w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
