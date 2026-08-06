<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useCartStore } from "shared";
import type { Product } from "shared";
import { useProductsApi } from "../composables";
import { formatCurrency } from "shared";

const route = useRoute();
const router = useRouter();
const cart = useCartStore();
const { getAll, getById } = useProductsApi();

const product = ref<Product | null>(null);
const relatedProducts = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function fetchProduct() {
  loading.value = true;
  error.value = null;

  try {
    const id = Number(route.params.id);
    const resp = await getById(id);
    product.value = (resp && (resp.product ?? resp)) as Product;

    if (product.value) {
      const response = await getAll({
        category: product.value.category,
        limit: 4,
      });

      // normalize response.products or array
      const items: Product[] = (response &&
        (response.products ?? response)) as Product[];
      relatedProducts.value = items
        .filter((p) => p.id !== product.value!.id)
        .slice(0, 3);
    }
  } catch (err: any) {
    error.value = err.message || "Failed to load product";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchProduct);

watch(
  () => route.params.id,
  () => {
    if (route.params.id) fetchProduct();
  },
);

function addToCart() {
  if (product.value) {
    cart.addToCart(product.value);
  }
}

function toggleWishlist() {
  if (!product.value) return;

  if (cart.isInWishlist(product.value.id)) {
    cart.removeFromWishlist(product.value.id);
  } else {
    cart.addToWishlist(product.value);
  }
}

function buyNow() {
  if (product.value) {
    cart.addToCart(product.value);
    router.push("/checkout");
  }
}
</script>

<template>
  <div class="mx-auto max-w-[1180px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
    <button
      @click="router.back()"
      class="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-100/90 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
    >
      ← Back to Products
    </button>

    <div
      v-if="loading"
      class="rounded-[30px] border border-slate-200 bg-white p-12 text-center shadow-lg"
    >
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600"
      ></div>
      <p class="mt-4 text-sm text-slate-500">Loading product...</p>
    </div>

    <div
      v-else-if="error"
      class="rounded-[30px] border border-red-200 bg-red-50 p-10 text-center text-red-700 shadow-sm"
    >
      <p class="text-lg font-semibold">{{ error }}</p>
      <button
        @click="fetchProduct()"
        class="mt-6 rounded-2xl bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Retry
      </button>
    </div>

    <div v-else-if="product" class="space-y-10">
      <div
        class="rounded-[32px] border border-slate-800/70 bg-slate-950/95 p-6 shadow-2xl"
      >
        <div class="grid gap-6 lg:grid-cols-[1.2fr_0.85fr]">
          <div class="space-y-6">
            <div
              class="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-950 shadow-xl"
            >
              <img
                :src="product.image"
                :alt="product.name"
                class="w-full object-cover max-h-[480px]"
              />
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-[28px] bg-slate-900 p-4 text-white shadow-md">
                <p class="text-xs uppercase tracking-[0.35em] text-cyan-300">
                  Product Snapshot
                </p>
                <h2 class="mt-4 text-xl font-black leading-tight">
                  {{ product.name }}
                </h2>
                <p class="mt-3 text-sm leading-6 text-slate-400">
                  Premium product details, modern craftsmanship and fast
                  delivery all in one place.
                </p>

                <div class="mt-6 grid gap-4">
                  <div class="rounded-3xl bg-slate-950/80 px-4 py-3">
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400"
                    >
                      Category
                    </p>
                    <p class="mt-2 text-sm font-semibold text-white">
                      {{ product.category }}
                    </p>
                  </div>
                  <div class="rounded-3xl bg-slate-950/80 px-4 py-3">
                    <p
                      class="text-xs uppercase tracking-[0.3em] text-slate-400"
                    >
                      Availability
                    </p>
                    <p class="mt-2 text-sm font-semibold text-white">
                      {{ product.inStock ? "In Stock" : "Out of Stock" }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="rounded-[28px] bg-white p-4 shadow-md">
                <h3
                  class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-500"
                >
                  Quick Specs
                </h3>
                <div class="mt-4 space-y-3 text-sm text-slate-600">
                  <div class="flex items-center justify-between">
                    <span>Rating</span>
                    <span class="font-semibold text-slate-900">{{
                      product.rating
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>Reviews</span>
                    <span class="font-semibold text-slate-900">{{
                      product.reviews
                    }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span>SKU</span>
                    <span class="font-semibold text-slate-900">{{
                      product.sku
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="rounded-[32px] bg-white p-7 shadow-lg">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <span
                  class="rounded-full bg-primary-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.35em] text-primary-700"
                >
                  {{ product.category }}
                </span>
                <span
                  class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                >
                  {{ product.inStock ? "In Stock" : "Out of Stock" }}
                </span>
              </div>

              <h1 class="mt-5 text-3xl font-black text-slate-900">
                {{ product.name }}
              </h1>

              <p class="mt-4 text-slate-600 leading-7">
                {{ product.description }}
              </p>

              <div class="mt-6 flex items-end gap-4">
                <div class="text-3xl font-black text-slate-900">
                  {{ formatCurrency(product.price) }}
                </div>
                <div class="text-sm text-slate-400 line-through">
                  {{ formatCurrency(product.price * 1.18) }}
                </div>
              </div>

              <div class="mt-6 grid gap-4 sm:grid-cols-2">
                <div
                  class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <p class="font-semibold text-slate-900">Free Delivery</p>
                  <p class="mt-1">On orders above ₹50</p>
                </div>
                <div
                  class="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600"
                >
                  <p class="font-semibold text-slate-900">Easy Returns</p>
                  <p class="mt-1">30-day hassle-free returns</p>
                </div>
              </div>

              <div class="mt-6 flex flex-wrap items-center gap-4">
                <button
                  @click="addToCart"
                  :disabled="!product.inStock"
                  class="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2 text-sm font-semibold text-white shadow transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {{
                    cart.isInCart(product.id)
                      ? "✓ Added to Cart"
                      : "Add to Cart"
                  }}
                </button>
                <button
                  @click="buyNow"
                  :disabled="!product.inStock"
                  class="rounded-2xl bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ⚡ Buy Now
                </button>
              </div>

              <button
                @click="toggleWishlist"
                class="mt-4 sm:mt-0 sm:w-auto rounded-full bg-pink-50 border border-pink-200 px-4 py-2 text-sm font-semibold text-pink-700 hover:bg-pink-100 transition"
              >
                {{
                  cart.isInWishlist(product.id)
                    ? "❤️ In Wishlist"
                    : "🤍 Add to Wishlist"
                }}
              </button>
            </div>

            <div class="rounded-[32px] bg-white p-6 shadow-lg">
              <h2 class="text-lg font-semibold text-slate-900">
                More Product Info
              </h2>
              <div class="mt-4 grid gap-4 text-sm text-slate-600">
                <div class="flex items-center justify-between">
                  <span>Delivery</span>
                  <span class="font-semibold text-slate-900">2-4 days</span>
                </div>
                <div class="flex items-center justify-between">
                  <span>Guarantee</span>
                  <span class="font-semibold text-slate-900"
                    >Secure checkout</span
                  >
                </div>
                <div class="flex items-center justify-between">
                  <span>Support</span>
                  <span class="font-semibold text-slate-900">24×7 service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section v-if="relatedProducts.length" class="space-y-6">
        <div
          class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 class="text-2xl font-bold text-cyan-300">Related Products</h2>
          <RouterLink
            to="/products"
            class="text-sm font-semibold text-primary-600 transition hover:text-primary-700"
          >
            Browse all products →
          </RouterLink>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <RouterLink
            v-for="rp in relatedProducts"
            :key="rp.id"
            :to="`/products/${rp.id}`"
            class="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-xl"
          >
            <div
              class="relative flex h-40 items-center justify-center bg-slate-50"
            >
              <img
                :src="rp.image"
                :alt="rp.name"
                class="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-105"
              />
            </div>
            <div class="space-y-2 p-3">
              <p class="text-sm font-semibold text-slate-900 line-clamp-2">
                {{ rp.name }}
              </p>
              <div class="flex items-center justify-between gap-4">
                <span class="text-base font-bold text-slate-900">{{
                  formatCurrency(rp.price)
                }}</span>
                <span
                  class="rounded-full bg-green-100 px-2 py-1 text-[11px] font-semibold text-green-700"
                >
                  {{ rp.inStock ? "In Stock" : "Sold Out" }}
                </span>
              </div>
            </div>
          </RouterLink>
        </div>
      </section>
    </div>

    <div
      v-else
      class="rounded-[30px] border border-slate-200 bg-white p-12 text-center shadow-lg"
    >
      <h2 class="text-2xl font-semibold text-slate-900">Product not found</h2>
      <RouterLink
        to="/products"
        class="mt-4 inline-flex rounded-2xl bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        Browse all products
      </RouterLink>
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
</style>
