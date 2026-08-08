<script setup lang="ts">
import { useCartStore } from "shared";
import { formatCurrency } from "shared";

const cart = useCartStore();
</script>

<template>
  <div class="min-h-[60vh] bg-slate-950 px-4 py-6 text-slate-100">
    <div class="mx-auto w-full max-w-300">
      <div
        class="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-[0_15px_35px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-slate-400">
            Wishlist
          </p>
          <h2 class="text-3xl font-black text-white">Saved items</h2>
        </div>
        <div
          class="inline-flex rounded-full bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200"
        >
          {{ cart.wishlist.length }} saved
        </div>
      </div>

      <div
        v-if="cart.wishlist.length === 0"
        class="rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-[0_15px_35px_rgba(15,23,42,0.2)]"
      >
        <span class="text-6xl block mb-4">❤️</span>
        <h3 class="text-2xl font-semibold text-white mb-3">
          Your wishlist is empty
        </h3>
        <p class="text-slate-400 mb-6">
          Save products now and revisit them later.
        </p>
        <RouterLink to="/products" class="btn-accent"
          >Browse Products</RouterLink
        >
      </div>

      <div v-else class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="product in cart.wishlist"
          :key="product.id"
          class="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85 shadow-[0_12px_28px_rgba(15,23,42,0.15)]"
        >
          <div class="relative overflow-hidden">
            <RouterLink :to="`/products/${product.id}`">
              <img
                :src="product.image"
                :alt="product.name"
                class="h-44 w-full object-cover transition duration-300 hover:scale-105"
              />
            </RouterLink>
            <button
              @click="cart.removeFromWishlist(product.id)"
              class="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/90 text-rose-400 shadow-lg shadow-black/10 transition hover:bg-slate-800"
              aria-label="Remove from wishlist"
            >
              ✕
            </button>
          </div>

          <div class="space-y-3 p-3">
            <RouterLink
              :to="`/products/${product.id}`"
              class="block text-base font-semibold text-white hover:text-accent-300"
            >
              {{ product.name }}
            </RouterLink>
            <div class="text-xl font-bold text-emerald-400">
              {{ formatCurrency(product.price) }}
            </div>
            <div
              class="text-sm font-medium"
              :class="product.inStock ? 'text-emerald-400' : 'text-rose-400'"
            >
              {{ product.inStock ? "In Stock" : "Out of Stock" }}
            </div>
            <button
              @click="
                cart.addToCart(product);
                cart.removeFromWishlist(product.id);
              "
              :disabled="!product.inStock"
              class="btn-accent w-full text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Move to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
