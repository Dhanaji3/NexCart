<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useCartStore } from "shared";
import type { Product, Category } from "shared";
import { useRoute } from "vue-router";
import { useProductsApi, useCategoriesApi } from "../composables";

const route = useRoute();
const cart = useCartStore();

const { products, loading, error, getAll: fetchProductsApi } = useProductsApi();
const { categories, getAll: fetchCategoriesApi } = useCategoriesApi();

const searchQuery = ref("");
const selectedCategory = ref((route.query.category as string) || "");
const sortBy = ref<"price-asc" | "price-desc" | "rating" | "name">("rating");

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
    // fallback silently
  }
}

onMounted(() => {
  fetchProducts();
  fetchCategories();
});

// Re-fetch when filters change
watch(
  [searchQuery, selectedCategory, sortBy],
  () => {
    fetchProducts();
  },
  { debounce: 300 } as any,
);

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>;
function onSearchInput(value: string) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery.value = value;
  }, 400);
}

function addToCart(product: Product) {
  cart.addToCart(product);
}
</script>

<template>
  <div class="py-4">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-slate-900 mb-1">Products</h2>
      <p class="text-sm text-slate-500">{{ products.length }} products found</p>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-4 items-center mb-6">
      <input
        :value="searchQuery"
        @input="onSearchInput(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="Search products..."
        class="input flex-1 min-w-[200px]"
      />
      <select v-model="selectedCategory" class="input w-auto">
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
          {{ cat.icon }} {{ cat.name }}
        </option>
      </select>
      <select v-model="sortBy" class="input w-auto">
        <option value="rating">Top Rated</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name">Name A-Z</option>
      </select>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center min-h-[30vh]"
    >
      <div
        class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"
      ></div>
      <p class="mt-4 text-slate-500">Loading products...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center p-8 text-danger-500">
      <p>{{ error }}</p>
      <button @click="fetchProducts()" class="btn-primary mt-4">Retry</button>
    </div>

    <!-- Product Grid -->
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-xl overflow-hidden shadow-card hover:-translate-y-1 transition-transform"
      >
        <RouterLink
          :to="`/products/${product.id}`"
          class="no-underline text-inherit"
        >
          <img
            :src="product.image"
            :alt="product.name"
            class="w-full h-48 object-cover"
          />
          <div class="p-4">
            <span class="text-xs text-slate-400 uppercase tracking-wide">{{
              product.category
            }}</span>
            <h3 class="text-base text-slate-800 mt-1 mb-1 truncate">
              {{ product.name }}
            </h3>
            <div class="text-xs text-slate-500 mb-2">
              ⭐ {{ product.rating }}
              <span class="text-slate-400">({{ product.reviews }})</span>
            </div>
            <div class="text-lg font-bold text-accent-600">
              ${{ product.price != null ? product.price.toFixed(2) : "0.00" }}
            </div>
          </div>
        </RouterLink>
        <div class="flex gap-2 px-4 pb-4">
          <button
            @click="addToCart(product)"
            :disabled="!product.inStock"
            class="btn-accent w-full"
          >
            {{
              cart.isInCart(product.id)
                ? "✓ In Cart"
                : product.inStock
                  ? "Add to Cart"
                  : "Out of Stock"
            }}
          </button>
          <button
            @click="cart.addToWishlist(product)"
            class="btn-outline w-10 !px-0"
            :class="{ '!border-danger-500': cart.isInWishlist(product.id) }"
          >
            {{ cart.isInWishlist(product.id) ? "❤️" : "🤍" }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!loading && !error && products.length === 0"
      class="text-center py-12 text-slate-500"
    >
      <p>No products found matching your criteria.</p>
    </div>
  </div>
</template>
