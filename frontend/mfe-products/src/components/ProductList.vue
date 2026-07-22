<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { RouterLink } from "vue-router";
import { useRoute } from "vue-router";
import { useCartStore } from "shared";
import type { Product } from "shared";

import { useProductsApi, useCategoriesApi } from "../composables";

const route = useRoute();
const cart = useCartStore();

const { products, loading, error, getAll: fetchProductsApi } = useProductsApi();

const { categories, getAll: fetchCategoriesApi } = useCategoriesApi();

const searchQuery = ref("");
const selectedCategory = ref((route.query.category as string) || "");

const sortBy = ref<"rating" | "price-asc" | "price-desc" | "name">("rating");

async function fetchProducts() {
  await fetchProductsApi({
    search: searchQuery.value || undefined,
    category: selectedCategory.value || undefined,
    sort: sortBy.value,
  });
}

async function fetchCategories() {
  try {
    await fetchCategoriesApi();
  } catch {
    //
  }
}

onMounted(async () => {
  await Promise.all([fetchProducts(), fetchCategories()]);
});

watch(
  [searchQuery, selectedCategory, sortBy],
  () => {
    fetchProducts();
  },
  { debounce: 300 } as any,
);

let searchTimer: ReturnType<typeof setTimeout>;

function onSearchInput(value: string) {
  clearTimeout(searchTimer);

  searchTimer = setTimeout(() => {
    searchQuery.value = value;
  }, 400);
}

function addToCart(product: Product) {
  cart.addToCart(product);
}

function resetFilters() {
  searchQuery.value = "";
  selectedCategory.value = "";
  sortBy.value = "rating";

  fetchProducts();
}
</script>

<template>
  <div class="space-y-8">
    <!-- ===================================================== -->
    <!-- HERO -->
    <!-- ===================================================== -->

    <section
      class="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-950 via-primary-900 to-primary-800 text-white shadow-xl"
    >
      <div
        class="grid items-center gap-8 px-6 py-8 md:grid-cols-[2fr_1fr] lg:px-10"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            NexCart Store
          </span>

          <h1 class="mt-5 text-3xl font-bold md:text-4xl">
            Discover Amazing Products
          </h1>

          <p
            class="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base"
          >
            Shop premium electronics, fashion, home essentials, accessories and
            much more. Fast delivery, secure payment and trusted quality.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <RouterLink
              to="/cart"
              class="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white no-underline transition hover:bg-accent-600"
            >
              View Cart
            </RouterLink>

            <RouterLink
              to="/wishlist"
              class="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white no-underline transition hover:bg-white/10"
            >
              Wishlist
            </RouterLink>
          </div>
        </div>

        <!-- Right -->

        <div class="hidden md:flex justify-center">
          <div class="rounded-3xl bg-white/10 p-8 backdrop-blur">
            <div class="grid grid-cols-2 gap-6 text-center">
              <div>
                <h3 class="text-3xl font-bold">
                  {{ products.length }}
                </h3>

                <p class="mt-1 text-xs uppercase tracking-wider text-slate-300">
                  Products
                </p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">
                  {{ categories.length }}
                </h3>

                <p class="mt-1 text-xs uppercase tracking-wider text-slate-300">
                  Categories
                </p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">4.9</h3>

                <p class="mt-1 text-xs uppercase tracking-wider text-slate-300">
                  Rating
                </p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">24/7</h3>

                <p class="mt-1 text-xs uppercase tracking-wider text-slate-300">
                  Support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- FILTERS -->
    <!-- ===================================================== -->

    <section class="rounded-3xl bg-white p-6 shadow-card">
      <div class="grid gap-5 lg:grid-cols-[2fr_1fr_1fr]">
        <!-- Search -->

        <div class="relative">
          <span
            class="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400"
          >
            🔍
          </span>

          <input
            :value="searchQuery"
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search products..."
            class="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition-all focus:border-primary-500 focus:bg-white"
          />
        </div>

        <!-- Category -->

        <select
          v-model="selectedCategory"
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 focus:bg-white"
        >
          <option value="">All Categories</option>

          <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </select>

        <!-- Sort -->

        <select
          v-model="sortBy"
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 focus:bg-white"
        >
          <option value="rating">⭐ Top Rated</option>

          <option value="price-asc">💰 Price : Low → High</option>

          <option value="price-desc">💰 Price : High → Low</option>

          <option value="name">🔤 Name (A-Z)</option>
        </select>
      </div>

      <div
        class="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5"
      >
        <div class="text-sm text-slate-500">
          Showing
          <span class="font-semibold text-slate-900">
            {{ products.length }}
          </span>
          products
        </div>

        <button
          v-if="searchQuery || selectedCategory"
          @click="resetFilters"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-primary-600 hover:text-primary-600"
        >
          Reset Filters
        </button>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- LOADING -->
    <!-- ===================================================== -->

    <div
      v-if="loading"
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="overflow-hidden rounded-2xl bg-white shadow-card"
      >
        <div class="h-60 animate-pulse bg-slate-200"></div>

        <div class="space-y-3 p-5">
          <div class="h-3 w-20 animate-pulse rounded bg-slate-200"></div>

          <div class="h-5 w-full animate-pulse rounded bg-slate-200"></div>

          <div class="h-5 w-2/3 animate-pulse rounded bg-slate-200"></div>

          <div class="h-4 w-24 animate-pulse rounded bg-slate-200"></div>

          <div class="h-10 animate-pulse rounded-xl bg-slate-200"></div>
        </div>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- ERROR -->
    <!-- ===================================================== -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-white py-20 text-center shadow-card"
    >
      <div class="mx-auto max-w-md">
        <div class="text-6xl">😕</div>

        <h2 class="mt-5 text-2xl font-bold text-slate-900">
          Something went wrong
        </h2>

        <p class="mt-3 text-slate-500">
          {{ error }}
        </p>

        <button
          @click="fetchProducts"
          class="mt-8 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    </div>

    <!-- ===================================================== -->
    <!-- PRODUCT GRID -->
    <!-- ===================================================== -->

    <div
      v-else
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <article
        v-for="product in products"
        :key="product.id"
        class="group overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      >
        <!-- IMAGE -->

        <div class="relative overflow-hidden bg-slate-100">
          <!-- SALE -->

          <span
            class="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          >
            Sale
          </span>

          <!-- WISHLIST -->

          <button
            @click.stop="cart.toggleWishlist(product)"
            class="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110 hover:bg-red-500 hover:text-white"
          >
            <span v-if="cart.isInWishlist(product.id)"> ❤️ </span>

            <span v-else> 🤍 </span>
          </button>

          <RouterLink :to="`/products/${product.id}`" class="block">
            <img
              :src="product.image"
              :alt="product.name"
              loading="lazy"
              class="mx-auto h-64 w-full object-contain p-6 transition duration-500 group-hover:scale-110"
            />
          </RouterLink>
        </div>

        <!-- CONTENT -->

        <div class="p-5">
          <!-- CATEGORY -->

          <p
            class="text-xs font-semibold uppercase tracking-[0.25em] text-primary-600"
          >
            {{ product.category }}
          </p>

          <!-- NAME -->

          <RouterLink :to="`/products/${product.id}`" class="no-underline">
            <h3
              class="mt-3 line-clamp-2 min-h-[56px] text-lg font-semibold text-slate-900 transition group-hover:text-primary-600"
            >
              {{ product.name }}
            </h3>
          </RouterLink>

          <!-- RATING -->

          <div class="mt-4 flex items-center justify-between">
            <div
              class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
            >
              ⭐ {{ product.rating }}
            </div>

            <div class="text-sm text-slate-400">
              {{ product.reviews }}
              Reviews
            </div>
          </div>

          <!-- PRICE -->

          <div class="mt-5 flex items-end justify-between">
            <div>
              <div class="text-2xl font-bold text-primary-700">
                ₹{{ product.price.toLocaleString() }}
              </div>

              <div class="text-sm text-slate-400 line-through">
                ₹{{ Math.round(product.price * 1.18).toLocaleString() }}
              </div>
            </div>

            <span
              v-if="product.inStock"
              class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
            >
              In Stock
            </span>

            <span
              v-else
              class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600"
            >
              Out of Stock
            </span>
          </div>

          <!-- ACTIONS -->

          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              @click="addToCart(product)"
              :disabled="!product.inStock"
              class="rounded-xl bg-accent-600 py-3 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {{
                cart.isInCart(product.id)
                  ? "✓ In Cart"
                  : product.inStock
                    ? "Add to Cart"
                    : "Sold Out"
              }}
            </button>

            <RouterLink
              :to="`/products/${product.id}`"
              class="rounded-xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 no-underline transition hover:border-primary-600 hover:text-primary-600"
            >
              View Details
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <!-- ===================================================== -->
    <!-- EMPTY STATE -->
    <!-- ===================================================== -->

    <div
      v-if="!loading && !error && products.length === 0"
      class="rounded-3xl bg-white py-20 text-center shadow-card"
    >
      <div class="mx-auto max-w-lg">
        <div class="text-7xl">📦</div>

        <h2 class="mt-6 text-3xl font-bold text-slate-900">
          No Products Found
        </h2>

        <p class="mx-auto mt-4 max-w-md text-slate-500">
          We couldn't find any products matching your search. Try changing your
          search keywords or clearing the filters.
        </p>

        <button
          @click="resetFilters"
          class="mt-8 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          Reset Filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 10px rgba(15, 23, 42, 0.05);
}

.group:hover .shadow-card {
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

button,
a,
select,
input {
  transition: all 0.25s ease;
}

input:focus,
select:focus {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

img {
  user-select: none;
}

@media (max-width: 640px) {
  h1 {
    font-size: 2rem;
  }
}
</style>
