<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useCartStore } from "shared";
import type { Product } from "shared";

import { useProductsApi, useCategoriesApi } from "../composables";
import { formatCurrency } from "shared";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();

const { products, loading, error, getAll: fetchProductsApi } = useProductsApi();

const { categories, getAll: fetchCategoriesApi } = useCategoriesApi();

const searchQuery = ref((route.query.search as string) || "");
const selectedCategory = ref((route.query.category as string) || "");

const sortBy = ref<"rating" | "price-asc" | "price-desc" | "name">("rating");

watch(
  () => route.query.search,
  (value) => {
    searchQuery.value = (value as string) || "";
  },
);

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

function buyNow(product: Product) {
  if (!product.inStock) return;

  // Avoid duplicate products in cart
  if (!cart.isInCart(product.id)) {
    cart.addToCart(product);
  }

  // Go directly to checkout
  router.push("/checkout");
}
</script>
<template>
  <div class="space-y-10">
    <!-- ===================================================== -->
    <!-- ========================================================= -->
    <!-- PREMIUM PRODUCTS HERO -->
    <!-- ========================================================= -->

    <section
      class="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-950 via-[#18254A] to-[#2B348C] border border-white/5 shadow-2xl"
    >
      <!-- Glow -->

      <div
        class="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-cyan-500/20 blur-[120px]"
      />

      <div
        class="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-600/20 blur-[120px]"
      />

      <!-- Grid -->

      <div
        class="relative grid items-center gap-8 lg:grid-cols-[2fr_360px] px-8 py-10 lg:px-14"
      >
        <!-- LEFT -->

        <div>
          <span
            class="inline-flex rounded-full bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300"
          >
            Premium Store
          </span>

          <h1
            class="mt-5 text-4xl lg:text-5xl font-black tracking-tight text-white"
          >
            Explore Premium Products
          </h1>

          <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Discover carefully selected products with premium quality,
            lightning-fast delivery and secure checkout.
          </p>

          <!-- Buttons -->

          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink
              to="/cart"
              class="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-7 py-3 font-semibold text-white no-underline transition hover:scale-105"
            >
              View Cart
            </RouterLink>

            <RouterLink
              to="/wishlist"
              class="rounded-2xl border border-white/15 bg-white/5 px-7 py-3 font-semibold text-white no-underline backdrop-blur transition hover:bg-white/10"
            >
              Wishlist
            </RouterLink>
          </div>
        </div>

        <!-- RIGHT -->

        <div class="hidden lg:block">
          <div
            class="rounded-[30px] border border-white/10 bg-white/10 backdrop-blur-xl p-8"
          >
            <div class="grid grid-cols-2 gap-8">
              <div>
                <div class="text-4xl font-black text-white">
                  {{ products.length }}
                </div>

                <div
                  class="mt-2 text-xs uppercase tracking-widest text-slate-300"
                >
                  Products
                </div>
              </div>

              <div>
                <div class="text-4xl font-black text-white">
                  {{ categories.length }}
                </div>

                <div
                  class="mt-2 text-xs uppercase tracking-widest text-slate-300"
                >
                  Categories
                </div>
              </div>

              <div>
                <div class="text-4xl font-black text-white">4.9</div>

                <div
                  class="mt-2 text-xs uppercase tracking-widest text-slate-300"
                >
                  Rating
                </div>
              </div>

              <div>
                <div class="text-4xl font-black text-white">24×7</div>

                <div
                  class="mt-2 text-xs uppercase tracking-widest text-slate-300"
                >
                  Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- PREMIUM FILTER BAR -->
    <!-- ========================================================= -->

    <section
      class="sticky top-24 z-30 rounded-[28px] border border-white/10 bg-slate-900/80 backdrop-blur-2xl shadow-[0_15px_40px_rgba(0,0,0,.35)] px-6 py-6"
    >
      <div class="grid gap-5 xl:grid-cols-[2fr_1fr_1fr_auto]">
        <!-- ===================================== -->
        <!-- SEARCH -->
        <!-- ===================================== -->

        <div class="relative">
          <svg
            class="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>

          <input
            :value="searchQuery"
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Search premium products..."
            class="w-full rounded-2xl border border-white/10 bg-slate-800 py-4 pl-14 pr-5 text-white placeholder:text-slate-500 outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
          />
        </div>

        <!-- ===================================== -->
        <!-- CATEGORY -->
        <!-- ===================================== -->

        <select
          v-model="selectedCategory"
          class="rounded-2xl border border-white/10 bg-slate-800 px-5 py-4 text-white outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
        >
          <option value="">All Categories</option>

          <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
            {{ cat.icon }} {{ cat.name }}
          </option>
        </select>

        <!-- ===================================== -->
        <!-- SORT -->
        <!-- ===================================== -->

        <select
          v-model="sortBy"
          class="rounded-2xl border border-white/10 bg-slate-800 px-5 py-4 text-white outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20"
        >
          <option value="rating">⭐ Top Rated</option>

          <option value="price-asc">₹ Price Low → High</option>

          <option value="price-desc">₹ Price High → Low</option>

          <option value="name">A → Z</option>
        </select>

        <!-- ===================================== -->
        <!-- RESET -->
        <!-- ===================================== -->

        <button
          v-if="searchQuery || selectedCategory"
          @click="resetFilters"
          class="rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 font-semibold text-white transition hover:scale-105"
        >
          Reset
        </button>
      </div>

      <!-- ===================================== -->
      <!-- BOTTOM -->
      <!-- ===================================== -->

      <div
        class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5"
      >
        <!-- Product Count -->

        <div class="text-slate-400">
          Showing

          <span class="font-bold text-white">
            {{ filteredProducts.length }}
          </span>

          Premium Products
        </div>

        <!-- Selected Category -->

        <div
          class="rounded-full bg-primary-500/20 px-4 py-2 text-sm font-semibold text-primary-300"
        >
          {{ selectedCategory || "All Categories" }}
        </div>
      </div>
    </section>

    <!-- ========================================================= -->
    <!-- LOADING -->
    <!-- ========================================================= -->

    <section
      v-if="loading"
      class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-lg"
      >
        <div class="h-[260px] animate-pulse bg-slate-200"></div>

        <div class="space-y-4 p-6">
          <div class="h-4 w-24 rounded bg-slate-200 animate-pulse"></div>

          <div class="h-6 rounded bg-slate-200 animate-pulse"></div>

          <div class="h-6 w-2/3 rounded bg-slate-200 animate-pulse"></div>

          <div class="h-10 rounded-xl bg-slate-200 animate-pulse"></div>

          <div class="grid grid-cols-2 gap-3">
            <div class="h-11 rounded-xl bg-slate-200 animate-pulse"></div>

            <div class="h-11 rounded-xl bg-slate-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
    <section
      v-if="!loading && !error && paginatedProducts.length === 0"
      class="rounded-[32px] bg-white py-24 shadow-xl"
    >
      <div class="text-center">
        <div class="text-7xl">📦</div>

        <h2 class="mt-6 text-4xl font-black">No Products Found</h2>

        <p class="mt-4 text-lg text-slate-500">
          Try changing your filters or search keyword.
        </p>

        <button
          @click="resetFilters"
          class="mt-8 rounded-2xl bg-primary-600 px-8 py-4 font-semibold text-white hover:bg-primary-700"
        >
          Reset Filters
        </button>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- ERROR -->
    <!-- ===================================================== -->
    <section v-if="error" class="rounded-[32px] bg-white py-24 shadow-xl">
      <div class="text-center">
        <div class="text-7xl">⚠️</div>

        <h2 class="mt-6 text-4xl font-black">Something went wrong</h2>

        <p class="mt-4 text-lg text-slate-500">
          {{ error }}
        </p>

        <button
          @click="fetchProducts"
          class="mt-8 rounded-2xl bg-primary-600 px-8 py-4 font-semibold text-white hover:bg-primary-700"
        >
          Try Again
        </button>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- PRODUCT GRID -->
    <!-- ===================================================== -->

    <section v-else class="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
      <!-- ===================================================== -->
      <article
        v-for="product in paginatedProducts"
        :key="product.id"
        class="group overflow-hidden rounded-[30px] bg-white border border-slate-200 transition-all duration-500 hover:-translate-y-2 hover:border-primary-300 hover:shadow-[0_25px_60px_rgba(37,99,235,.18)]"
      >
        <!-- ====================================== -->
        <!-- IMAGE AREA -->
        <!-- ====================================== -->

        <div
          class="relative flex h-[260px] items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100"
        >
          <!-- Sale -->

          <div
            class="absolute left-4 top-4 z-20 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          >
            SALE
          </div>

          <!-- Wishlist -->

          <button
            @click.stop="cart.toggleWishlist(product)"
            class="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur transition-all duration-300 hover:scale-110"
          >
            <span
              v-if="cart.isInWishlist(product.id)"
              class="text-red-500 text-xl"
            >
              ❤️
            </span>

            <span v-else class="text-slate-500 text-xl"> ♡ </span>
          </button>

          <!-- Image -->

          <RouterLink
            :to="`/products/${product.id}`"
            class="flex h-full w-full items-center justify-center"
          >
            <img
              :src="product.image"
              :alt="product.name"
              loading="lazy"
              class="h-[190px] object-contain transition-all duration-500 group-hover:scale-110"
            />
          </RouterLink>
        </div>

        <!-- ====================================== -->
        <!-- CONTENT -->
        <!-- ====================================== -->

        <div class="p-6">
          <!-- Category -->

          <div
            class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600"
          >
            {{ product.category }}
          </div>

          <!-- Product Name -->

          <RouterLink :to="`/products/${product.id}`" class="no-underline">
            <h3
              class="mt-3 min-h-[58px] line-clamp-2 text-lg font-bold leading-7 text-slate-900 transition group-hover:text-primary-600"
            >
              {{ product.name }}
            </h3>
          </RouterLink>

          <!-- Rating -->

          <div class="mt-5 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-yellow-500"> ⭐⭐⭐⭐⭐ </span>

              <span class="font-semibold text-slate-700">
                {{ product.rating }}
              </span>
            </div>

            <span class="text-sm text-slate-400"> 250+ </span>
          </div>

          <!-- Price -->

          <div class="mt-6 flex items-end justify-between">
            <div>
              <div class="text-3xl font-black text-primary-700">
                {{ formatCurrency(product.price) }}
              </div>

              <div class="mt-1 flex items-center gap-2">
                <span class="text-sm text-slate-400 line-through">
                  {{ formatCurrency(product.price * 1.25) }}
                </span>

                <span
                  class="rounded-full bg-green-100 px-2 py-1 text-[11px] font-bold text-green-700"
                >
                  20% OFF
                </span>
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
              class="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
            >
              Sold Out
            </span>
          </div>

          <!-- ====================================== -->
          <!-- TRUST BADGES -->
          <!-- ====================================== -->

          <div class="mt-5 flex flex-wrap gap-2">
            <span
              class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
            >
              🚚 Free Delivery
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              🔒 Secure
            </span>

            <span
              class="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
            >
              ⭐ Best Seller
            </span>
          </div>

          <!-- ====================================== -->
          <!-- BUY NOW -->
          <!-- ====================================== -->

          <button
            @click="buyNow(product)"
            :disabled="!product.inStock"
            class="mt-6 w-full rounded-2xl bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⚡ Buy Now
          </button>

          <!-- ====================================== -->
          <!-- ACTIONS -->
          <!-- ====================================== -->

          <div class="mt-4 grid grid-cols-2 gap-3">
            <button
              @click="addToCart(product)"
              :disabled="!product.inStock"
              class="rounded-xl border border-primary-600 bg-primary-50 py-3 text-sm font-semibold text-primary-700 transition-all hover:bg-primary-600 hover:text-white disabled:opacity-50"
            >
              {{ cart.isInCart(product.id) ? "✓ In Cart" : "Add Cart" }}
            </button>

            <RouterLink
              :to="`/products/${product.id}`"
              class="rounded-xl border border-slate-300 py-3 text-center text-sm font-semibold text-slate-700 no-underline transition-all hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700"
            >
              Details
            </RouterLink>
          </div>
        </div>
      </article>
    </section>
    <!-- ===================================================== -->

    <section
      v-if="!loading && !error && products.length === 0"
      class="rounded-[32px] border border-slate-200 bg-white px-8 py-24 text-center shadow-xl"
    >
      <div
        class="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-6xl"
      >
        📦
      </div>

      <h2 class="mt-8 text-4xl font-black text-slate-900">No Products Found</h2>

      <p class="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-500">
        We couldn't find any products matching your search. Try changing the
        filters or browse all categories.
      </p>

      <button
        @click="resetFilters"
        class="mt-10 rounded-2xl bg-primary-600 px-8 py-4 font-semibold text-white transition hover:bg-primary-700"
      >
        Reset Filters
      </button>
    </section>
    <!-- ===================================================== -->
    <!-- PAGINATION -->
    <!-- ===================================================== -->

    <section v-if="totalPages > 1" class="flex justify-center py-12">
      <div class="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-xl">
        <button
          @click="previousPage"
          :disabled="currentPage === 1"
          class="rounded-xl px-5 py-3 font-semibold hover:bg-slate-100 disabled:opacity-40"
        >
          ←
        </button>

        <button
          v-for="page in totalPages"
          :key="page"
          @click="goToPage(page)"
          class="h-11 w-11 rounded-xl font-semibold transition"
          :class="
            page === currentPage
              ? 'bg-primary-600 text-white'
              : 'hover:bg-slate-100'
          "
        >
          {{ page }}
        </button>

        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="rounded-xl px-5 py-3 font-semibold hover:bg-slate-100 disabled:opacity-40"
        >
          →
        </button>
      </div>
    </section>
  </div>
</template>
<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

article {
  transition: 0.35s;
}

article:hover {
  transform: translateY(-10px);
}

img {
  transition: 0.45s;
}

.group:hover img {
  transform: scale(1.08);
}

button {
  transition: 0.3s;
}

section {
  animation: fadeUp 0.45s ease;
}

/* Product Card */

.product-card {
  transition: all 0.35s ease;
}

.product-card:hover {
  transform: translateY(-8px);
}

/* Image */

.product-card img {
  transition: transform 0.45s ease;
}

.product-card:hover img {
  transform: scale(1.08);
}

/* Buy Button */

.buy-btn {
  transition: all 0.3s ease;
}

.buy-btn:hover {
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
}

/* Wishlist */

.wishlist-btn:hover {
  transform: scale(1.12);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1280px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 2.3rem;
  }

  h2 {
    font-size: 1.8rem;
  }
}
</style>
