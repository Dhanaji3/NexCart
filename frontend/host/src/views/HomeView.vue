<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { Product, Category } from "shared";
import { useHomeApi } from "../composables";

const { featuredProducts, categories, loading, fetchHome } = useHomeApi();
const activeSlide = ref(0);
let carouselTimer: ReturnType<typeof setInterval> | null = null;

const heroSlides = computed(() => featuredProducts.value.slice(0, 6));
const featuredGridProducts = computed(() => featuredProducts.value.slice(0, 8));

function startCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }

  if (heroSlides.value.length <= 1) {
    return;
  }

  carouselTimer = setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.value.length;
  }, 5000);
}

function goToSlide(index: number) {
  activeSlide.value = index;
}

onMounted(async () => {
  await fetchHome();
  startCarousel();
});

onBeforeUnmount(() => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }
});
</script>

<template>
  <div class="flex flex-col gap-12">
    <!-- Hero Section -->
    <section
      class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-950 to-primary-800 text-white"
    >
      <div
        v-if="heroSlides.length"
        class="relative min-h-[260px] sm:min-h-[320px] lg:min-h-[360px]"
      >
        <div
          v-for="(product, index) in heroSlides"
          :key="product.id"
          v-show="activeSlide === index"
          class="absolute inset-0 transition-opacity duration-500"
        >
          <div
            class="grid h-full items-center gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr] md:px-10 lg:px-12"
          >
            <div class="max-w-xl">
              <p
                class="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent-300"
              >
                Trending now
              </p>
              <h1 class="mb-3 text-3xl font-bold sm:text-4xl">
                {{ product.name }}
              </h1>
              <p class="mb-6 text-base text-slate-200 sm:text-lg">
                Discover this featured product with premium quality and fast
                delivery.
              </p>
              <div class="flex flex-wrap items-center gap-3">
                <RouterLink
                  :to="`/products/${product.id}`"
                  class="inline-flex items-center justify-center rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-accent-600"
                >
                  Shop This Item
                </RouterLink>
                <RouterLink
                  to="/products"
                  class="inline-flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 font-semibold text-white no-underline transition-colors hover:bg-white/10"
                >
                  Browse All
                </RouterLink>
              </div>
            </div>
            <div class="hidden md:flex md:justify-end">
              <img
                :src="product.image"
                :alt="product.name"
                class="h-48 w-full max-w-[18rem] rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="px-8 py-16 text-center">
        <h1 class="mb-3 text-4xl font-bold">Welcome to NexCart</h1>
        <p class="mb-6 text-lg text-slate-300">
          Explore curated items from our ecommerce powered marketplace
        </p>
        <RouterLink
          to="/products"
          class="inline-block rounded-lg bg-accent-500 px-8 py-3 text-lg font-semibold text-white no-underline transition-colors hover:bg-accent-600"
        >
          Shop Now
        </RouterLink>
      </div>

      <div
        v-if="heroSlides.length > 1"
        class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2"
      >
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.id"
          type="button"
          class="h-2.5 w-2.5 rounded-full border border-white/60 transition-all"
          :class="activeSlide === index ? 'bg-white' : 'bg-white/30'"
          :aria-label="`Go to slide ${index + 1}`"
          @click="goToSlide(index)"
        />
      </div>
    </section>

    <!-- Categories Section -->
    <section>
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Shop by Category</h2>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.slug}`"
          class="flex flex-col items-center gap-2 p-5 bg-white rounded-xl no-underline shadow-card hover:-translate-y-0.5 hover:shadow-elevated transition-all"
        >
          <span class="text-3xl">{{ cat.icon }}</span>
          <span class="font-medium text-slate-700 text-sm">{{ cat.name }}</span>
        </RouterLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section>
      <h2 class="text-2xl font-bold text-slate-900 mb-4">Featured Products</h2>
      <div
        v-if="loading"
        class="flex flex-col items-center justify-center min-h-[20vh] gap-3 text-slate-400"
      >
        <div
          class="w-9 h-9 border-[3px] border-slate-200 border-t-primary-500 rounded-full animate-spin"
        ></div>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="product in featuredGridProducts"
          :key="product.id"
          class="bg-white rounded-xl overflow-hidden shadow-card hover:-translate-y-1 transition-transform"
        >
          <img
            :src="product.image"
            :alt="product.name"
            class="w-full h-48 object-cover"
          />
          <div class="p-4">
            <h3 class="text-sm font-semibold text-slate-800 mb-2 truncate">
              {{ product.name }}
            </h3>
            <div class="flex justify-between items-center mb-3">
              <span class="text-lg font-bold text-accent-600"
                >${{ product.price.toFixed(2) }}</span
              >
              <span class="text-xs text-slate-500"
                >⭐ {{ product.rating }}</span
              >
            </div>
            <RouterLink
              :to="`/products/${product.id}`"
              class="block text-center py-2 bg-slate-100 text-slate-700 no-underline rounded-lg text-sm font-medium hover:bg-primary-600 hover:text-white transition-colors"
            >
              View Details
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="text-center mt-6">
        <RouterLink
          to="/products"
          class="text-primary-600 no-underline font-semibold hover:text-primary-700"
        >
          View All Products →
        </RouterLink>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="text-center p-6 bg-white rounded-xl shadow-card">
        <span class="text-3xl block mb-2">🚚</span>
        <h3 class="text-sm font-semibold text-slate-800 mb-1">Free Shipping</h3>
        <p class="text-xs text-slate-500">On orders over $50</p>
      </div>
      <div class="text-center p-6 bg-white rounded-xl shadow-card">
        <span class="text-3xl block mb-2">🔒</span>
        <h3 class="text-sm font-semibold text-slate-800 mb-1">
          Secure Payment
        </h3>
        <p class="text-xs text-slate-500">100% secure checkout</p>
      </div>
      <div class="text-center p-6 bg-white rounded-xl shadow-card">
        <span class="text-3xl block mb-2">↩️</span>
        <h3 class="text-sm font-semibold text-slate-800 mb-1">Easy Returns</h3>
        <p class="text-xs text-slate-500">30-day return policy</p>
      </div>
      <div class="text-center p-6 bg-white rounded-xl shadow-card">
        <span class="text-3xl block mb-2">💬</span>
        <h3 class="text-sm font-semibold text-slate-800 mb-1">24/7 Support</h3>
        <p class="text-xs text-slate-500">Dedicated customer service</p>
      </div>
    </section>
  </div>
</template>
