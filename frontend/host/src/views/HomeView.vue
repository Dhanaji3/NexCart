<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

import { useHomeApi } from "../composables";
import { useCartStore, formatCurrency } from "shared";

import type { Product } from "shared";

/* -------------------------------------------------------
    ROUTER
-------------------------------------------------------- */

const router = useRouter();

/* -------------------------------------------------------
    STORES
-------------------------------------------------------- */

const cart = useCartStore();

/* -------------------------------------------------------
    HOME API
-------------------------------------------------------- */

const { featuredProducts, categories, loading, fetchHome } = useHomeApi();

/* -------------------------------------------------------
    HERO PRODUCTS
-------------------------------------------------------- */

const activeSlide = ref(0);

const heroSlides = computed(() => featuredProducts.value.slice(0, 5));

const featuredGridProducts = computed(() => featuredProducts.value.slice(0, 8));

/* -------------------------------------------------------
    HEADER SHADOW
-------------------------------------------------------- */

/* -------------------------------------------------------
    HERO SLIDER
-------------------------------------------------------- */

let carouselTimer: ReturnType<typeof setInterval> | null = null;

const nextSlide = () => {
  if (!heroSlides.value.length) return;

  activeSlide.value = (activeSlide.value + 1) % heroSlides.value.length;
};

const prevSlide = () => {
  if (!heroSlides.value.length) return;

  activeSlide.value =
    (activeSlide.value - 1 + heroSlides.value.length) % heroSlides.value.length;
};

const goToSlide = (index: number) => {
  activeSlide.value = index;
};

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};

const startCarousel = () => {
  stopCarousel();

  if (heroSlides.value.length <= 1) return;

  carouselTimer = setInterval(() => {
    nextSlide();
  }, 4500);
};

/* -------------------------------------------------------
    TOUCH SUPPORT
-------------------------------------------------------- */

let touchStart = 0;

const onTouchStart = (event: TouchEvent) => {
  touchStart = event.changedTouches[0].clientX;
};

const onTouchEnd = (event: TouchEvent) => {
  const touchEnd = event.changedTouches[0].clientX;

  if (touchStart - touchEnd > 70) {
    nextSlide();
  }

  if (touchEnd - touchStart > 70) {
    prevSlide();
  }
};

const pauseHero = () => stopCarousel();
const resumeHero = () => startCarousel();

/* -------------------------------------------------------
    CART
-------------------------------------------------------- */

function addToCart(product: Product) {
  cart.addToCart(product);
}

const buyNow = (product: Product) => {
  if (!product.inStock) return;

  if (!cart.isInCart(product.id)) {
    cart.addToCart(product);
  }

  router.push("/checkout");
};

/* -------------------------------------------------------
    LIFECYCLE
-------------------------------------------------------- */

onMounted(async () => {
  await fetchHome();

  startCarousel();
});

onBeforeUnmount(() => {
  stopCarousel();
});
</script>
<template>
  <div class="flex flex-col gap-6">
    <!-- ===================================================== -->
    <!-- HERO -->
    <!-- ===================================================== -->

    <section
      v-if="heroSlides.length"
      class="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-slate-950 via-primary-900 to-primary-700"
      @mouseenter="pauseHero"
      @mouseleave="resumeHero"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Background Blur -->

      <div
        class="absolute -right-28 -top-28 h-64 w-64 rounded-full bg-cyan-400/20 blur-[100px]"
      />

      <div
        class="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-primary-500/20 blur-[80px]"
      />

      <Transition name="fade" mode="out-in">
        <div
          :key="heroSlides[activeSlide].id"
          class="grid min-h-[220px] items-center gap-3 px-4 py-4 sm:px-6 lg:min-h-[250px] lg:grid-cols-[1fr_1fr] lg:px-10"
        >
          <!-- ================================================= -->
          <!-- LEFT -->
          <!-- ================================================= -->

          <div class="relative z-10 max-w-xl">
            <!-- Badge -->

            <span
              class="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300"
            >
              New Arrival
            </span>

            <!-- Title -->

            <h1
              class="mt-4 text-2xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-[2.2rem]"
            >
              {{ heroSlides[activeSlide].name }}
            </h1>

            <!-- Description -->

            <p class="mt-3 max-w-lg text-sm leading-6 text-slate-300">
              Premium quality products crafted for modern lifestyles. Enjoy
              secure checkout, lightning-fast delivery and trusted support.
            </p>

            <!-- Price -->

            <div class="mt-4 flex items-center gap-3">
              <span class="text-2xl font-black text-white">
                {{ formatCurrency(heroSlides[activeSlide].price) }}
              </span>

              <span
                class="rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white"
              >
                SALE
              </span>
            </div>

            <!-- Features -->

            <div class="mt-4 flex flex-wrap gap-2">
              <div
                class="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur"
              >
                🚚 Free Delivery
              </div>

              <div
                class="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur"
              >
                🔒 Secure Payment
              </div>

              <div
                class="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur"
              >
                ↩ 30 Days Return
              </div>
            </div>

            <!-- Buttons -->

            <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                @click="buyNow(heroSlides[activeSlide])"
                class="w-full rounded-xl bg-cyan-500 px-5 py-2 font-semibold text-white transition hover:scale-105 hover:bg-cyan-400 sm:w-auto"
              >
                Buy Now
              </button>

              <RouterLink
                to="/products"
                class="w-full rounded-xl border border-white/20 px-5 py-2 font-semibold text-white no-underline transition hover:bg-white/10 sm:w-auto"
              >
                Explore Products
              </RouterLink>
            </div>
          </div>

          <!-- ================================================= -->
          <!-- RIGHT -->
          <!-- ================================================= -->

          <div class="relative flex items-center justify-center">
            <!-- Glow -->

            <div
              class="absolute h-72 w-72 rounded-full bg-cyan-400/20 blur-[90px]"
            ></div>

            <!-- Product Image -->

            <img
              :src="heroSlides[activeSlide].image"
              :alt="heroSlides[activeSlide].name"
              class="relative z-10 h-[160px] object-contain transition duration-500 hover:scale-105 md:h-[190px] lg:h-[210px]"
            />
            <!-- 
            <div
              class="absolute bottom-4 right-4 hidden rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl xl:block"
            >
              <div class="text-yellow-400 text-lg">⭐⭐⭐⭐⭐</div>

              <div class="mt-2 text-3xl font-black text-white">4.9</div>

              <div class="text-xs uppercase tracking-widest text-slate-300">
                Customer Rating
              </div>
            </div> -->

            <!-- Floating Offer Card -->
            <!-- 
            <div
              class="absolute left-0 top-8 hidden rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur-xl lg:block"
            >
              <div class="text-xs uppercase tracking-widest text-cyan-300">
                OFFER
              </div>

              <div class="mt-1 text-2xl font-black text-white">50% OFF</div>

              <div class="text-xs text-slate-300">Limited Time</div>
            </div> -->
          </div>
        </div>
      </Transition>

      <!-- Previous -->

      <button
        v-if="heroSlides.length > 1"
        @click="prevSlide"
        class="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur-lg transition hover:bg-cyan-500 lg:flex"
      >
        ❮
      </button>

      <!-- Next -->

      <button
        v-if="heroSlides.length > 1"
        @click="nextSlide"
        class="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-xl text-white backdrop-blur-lg transition hover:bg-cyan-500 lg:flex"
      >
        ❯
      </button>

      <!-- Mobile Controls -->

      <div
        v-if="heroSlides.length > 1"
        class="absolute bottom-5 right-5 flex gap-3 lg:hidden"
      >
        <button
          @click="prevSlide"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg"
        >
          ❮
        </button>

        <button
          @click="nextSlide"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg"
        >
          ❯
        </button>
      </div>

      <!-- Indicators -->

      <div
        v-if="heroSlides.length > 1"
        class="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2"
      >
        <button
          v-for="(slide, index) in heroSlides"
          :key="slide.id"
          @click="goToSlide(index)"
          class="h-2 rounded-full transition-all duration-300"
          :class="
            activeSlide === index
              ? 'w-8 bg-cyan-400'
              : 'w-2 bg-white/40 hover:bg-white'
          "
        />
      </div>
    </section>

    <!-- Empty State -->

    <section
      v-else
      class="flex min-h-[380px] flex-col items-center justify-center rounded-[28px] bg-gradient-to-br from-slate-950 via-primary-900 to-primary-700 px-6 text-center"
    >
      <h1 class="text-3xl font-black text-white">Welcome to NexCart</h1>

      <p class="mt-3 max-w-lg text-slate-300">
        Discover premium products with secure checkout, fast delivery and
        amazing offers.
      </p>

      <RouterLink
        to="/products"
        class="mt-6 rounded-xl bg-cyan-500 px-7 py-3 font-semibold text-white no-underline transition hover:bg-cyan-400"
      >
        Explore Products
      </RouterLink>
    </section>

    <!-- ===================================================== -->
    <!-- CATEGORIES -->
    <!-- ===================================================== -->

    <section class="py-10">
      <div
        class="mb-6 flex flex-col gap-4 rounded-3xl bg-white/5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-4"
      >
        <div>
          <span
            class="rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary-700"
          >
            Categories
          </span>

          <h2 class="mt-4 text-2xl font-black tracking-tight text-slate-500">
            Shop By Category
          </h2>

          <p class="mt-3 max-w-xl text-sm text-slate-500">
            Explore products across multiple premium categories.
          </p>
        </div>

        <RouterLink
          to="/products"
          class="hidden md:inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white no-underline transition hover:bg-primary-700 lg:flex"
        >
          View All →
        </RouterLink>
      </div>

      <div
        class="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
      >
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.slug}`"
          class="group overflow-hidden rounded-[28px] bg-white p-6 text-center shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl no-underline"
        >
          <div
            class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl transition duration-300 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white"
          >
            {{ cat.icon }}
          </div>

          <h3 class="mt-4 text-base font-bold text-slate-500">
            {{ cat.name }}
          </h3>

          <p class="mt-2 text-xs text-slate-500">Premium Collection</p>

          <div class="mt-5 text-sm font-semibold text-primary-600">
            Explore →
          </div>
        </RouterLink>
      </div>

      <div class="mt-8 flex justify-center md:hidden">
        <RouterLink
          to="/products"
          class="inline-flex rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          View All Categories →
        </RouterLink>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- FEATURED PRODUCTS -->
    <!-- ===================================================== -->

    <section class="py-10">
      <!-- Heading -->

      <div
        class="mb-8 flex flex-col gap-4 rounded-3xl bg-white/5 p-5 lg:flex-row lg:items-end lg:justify-between lg:p-4"
      >
        <div>
          <span
            class="rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary-700"
          >
            Featured Products
          </span>

          <h2 class="mt-5 text-3xl font-black tracking-tight text-slate-500">
            Best Selling Products
          </h2>

          <p class="mt-3 max-w-2xl text-sm text-slate-500">
            Hand-picked products loved by thousands of customers.
          </p>
        </div>

        <RouterLink
          to="/products"
          class="hidden md:inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          View All →
        </RouterLink>
      </div>
      <div class="mt-8 flex justify-center md:hidden">
        <RouterLink
          to="/products"
          class="inline-flex rounded-2xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          Browse All Products →
        </RouterLink>
      </div>
      <!-- Loading -->

      <div
        v-if="loading"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="animate-pulse rounded-[28px] bg-white p-6 shadow-lg"
        >
          <div class="h-56 rounded-2xl bg-slate-200"></div>

          <div class="mt-5 h-5 rounded bg-slate-200"></div>

          <div class="mt-3 h-5 w-2/3 rounded bg-slate-200"></div>

          <div class="mt-6 h-10 rounded-xl bg-slate-200"></div>
        </div>
      </div>

      <!-- Products -->

      <div v-else class="grid gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="product in featuredGridProducts"
          :key="product.id"
          class="group overflow-hidden rounded-[30px] bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
        >
          <!-- Image -->

          <div class="relative overflow-hidden bg-slate-100">
            <!-- Sale -->

            <span
              class="absolute left-4 top-4 z-20 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white"
            >
              SALE
            </span>

            <!-- Wishlist -->

            <button
              @click.stop="cart.toggleWishlist(product)"
              class="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg transition hover:scale-110 hover:bg-red-500 hover:text-white"
            >
              <span v-if="cart.isInWishlist(product.id)"> ❤️ </span>

              <span v-else> 🤍 </span>
            </button>

            <!-- Image -->

            <RouterLink :to="`/products/${product.id}`" class="block">
              <img
                :src="product.image"
                :alt="product.name"
                class="mx-auto h-44 w-full object-contain p-3 transition duration-500 group-hover:scale-110"
              />
            </RouterLink>
          </div>

          <!-- Content -->

          <div class="p-4">
            <!-- Category -->

            <p
              class="text-xs font-bold uppercase tracking-[0.3em] text-primary-600"
            >
              {{ product.category }}
            </p>

            <!-- Name -->

            <RouterLink :to="`/products/${product.id}`" class="no-underline">
              <h3
                class="mt-2 line-clamp-2 min-h-[42px] text-sm font-bold text-slate-500 transition group-hover:text-primary-600"
              >
                {{ product.name }}
              </h3>
            </RouterLink>

            <!-- Rating -->

            <div class="mt-4 flex items-center justify-between">
              <div
                class="rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
              >
                ⭐ {{ product.rating }}
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

            <!-- Price -->

            <div class="mt-3 flex items-end justify-between">
              <div>
                <div class="text-xl font-black text-primary-700">
                  {{ formatCurrency(product.price) }}
                </div>

                <div class="text-sm text-slate-400 line-through">
                  {{ formatCurrency(product.price * 1.18) }}
                </div>
              </div>

              <div class="text-xs font-semibold text-green-600">
                Free Delivery
              </div>
            </div>

            <!-- Buy Now -->

            <button
              @click="buyNow(product)"
              :disabled="!product.inStock"
              class="mt-3 w-full rounded-2xl bg-cyan-500 py-2 font-bold text-white transition hover:bg-cyan-400 hover:scale-[1.02] hover:shadow-xl disabled:bg-slate-300"
            >
              ⚡ Buy Now
            </button>

            <!-- Bottom Buttons -->

            <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                @click="addToCart(product)"
                :disabled="!product.inStock"
                class="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 py-2 text-sm font-semibold text-white transition hover:from-cyan-300 hover:to-blue-500 disabled:bg-slate-300"
              >
                {{ cart.isInCart(product.id) ? "✓ In Cart" : "Add To Cart" }}
              </button>

              <RouterLink
                :to="`/products/${product.id}`"
                class="rounded-xl border border-slate-300 py-2 text-center text-sm font-semibold text-slate-700 no-underline transition hover:border-primary-600 hover:text-primary-600"
              >
                Details
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Mobile Button -->
    </section>
    <!-- ===================================================== -->
    <!-- MEGA SALE BANNER -->
    <!-- ===================================================== -->

    <section
      class="overflow-hidden rounded-[28px] bg-gradient-to-r from-primary-700 via-primary-600 to-cyan-500"
    >
      <div class="grid items-center gap-6 px-5 py-7 lg:grid-cols-2 lg:px-10">
        <div>
          <span
            class="rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.35em] text-white"
          >
            Limited Time Offer
          </span>

          <h2 class="mt-5 text-3xl font-black text-white">Up To 50% OFF</h2>

          <p class="mt-4 max-w-lg text-sm leading-6 text-blue-100">
            Grab your favourite products before the offer ends.
          </p>

          <RouterLink
            to="/products"
            class="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-bold text-primary-700 no-underline transition hover:scale-105"
          >
            Shop Deals →
          </RouterLink>
        </div>

        <div class="hidden justify-center lg:flex">
          <div class="rounded-[28px] bg-white/10 p-6 backdrop-blur-xl">
            <div class="grid grid-cols-2 gap-6 text-center text-white">
              <div>
                <div class="text-3xl font-black">5K+</div>

                <p class="text-xs uppercase tracking-widest">Products</p>
              </div>

              <div>
                <div class="text-3xl font-black">25K+</div>

                <p class="text-xs uppercase tracking-widest">Customers</p>
              </div>

              <div>
                <div class="text-3xl font-black">4.9</div>

                <p class="text-xs uppercase tracking-widest">Rating</p>
              </div>

              <div>
                <div class="text-3xl font-black">24×7</div>

                <p class="text-xs uppercase tracking-widest">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- WHY CHOOSE US -->
    <!-- ===================================================== -->

    <section class="py-12">
      <div class="text-center">
        <span
          class="rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary-700"
        >
          Why Choose Us
        </span>

        <h2 class="mt-4 text-3xl font-black text-slate-500">
          Shopping Made Better
        </h2>

        <p class="mx-auto mt-4 max-w-2xl text-base text-slate-500">
          We provide premium shopping experience from purchase to delivery.
        </p>
      </div>

      <div class="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div
          class="group rounded-[28px] bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
        >
          <div class="mx-auto text-5xl">🚚</div>
          <h3 class="mt-6 text-xl font-bold">Fast Delivery</h3>
          <p class="mt-3 text-slate-500">Free shipping on eligible orders.</p>
        </div>

        <div
          class="group rounded-[28px] bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
        >
          <div class="mx-auto text-5xl">🔒</div>
          <h3 class="mt-6 text-xl font-bold">Secure Payments</h3>
          <p class="mt-3 text-slate-500">Trusted payment gateways.</p>
        </div>

        <div
          class="group rounded-[28px] bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
        >
          <div class="mx-auto text-5xl">↩️</div>
          <h3 class="mt-6 text-xl font-bold">Easy Returns</h3>
          <p class="mt-3 text-slate-500">Hassle-free 30-day returns.</p>
        </div>

        <div
          class="group rounded-[28px] bg-white p-8 text-center shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
        >
          <div class="mx-auto text-5xl">💬</div>
          <h3 class="mt-6 text-xl font-bold">24×7 Support</h3>
          <p class="mt-3 text-slate-500">Friendly customer support anytime.</p>
        </div>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- NEWSLETTER -->
    <!-- ===================================================== -->

    <section class="overflow-hidden rounded-[32px] bg-white shadow-xl">
      <div class="grid items-center gap-5 px-5 py-7 lg:grid-cols-2 lg:px-10">
        <div>
          <span
            class="rounded-full bg-primary-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.35em] text-primary-700"
          >
            Newsletter
          </span>

          <h2 class="mt-4 text-2xl font-black text-slate-500">Stay Updated</h2>

          <p class="mt-3 text-sm text-slate-500">
            Subscribe for exclusive offers and new arrivals.
          </p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 rounded-2xl border border-slate-300 px-5 py-4 outline-none focus:border-primary-600"
          />

          <button
            class="rounded-2xl bg-primary-600 px-8 py-4 font-semibold text-white transition hover:bg-primary-700"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>

    <!-- ===================================================== -->
    <!-- FINAL CTA -->
    <!-- ===================================================== -->

    <section class="rounded-[32px] bg-slate-900 px-6 py-10 text-center">
      <h2 class="text-2xl font-black text-white">Ready To Start Shopping?</h2>

      <p class="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
        Discover thousands of premium products with secure checkout and fast
        delivery.
      </p>

      <RouterLink
        to="/products"
        class="mt-5 inline-flex rounded-2xl bg-primary-600 px-7 py-3 font-bold text-white no-underline transition hover:bg-primary-700"
      >
        Explore Products →
      </RouterLink>
    </section>
  </div>
</template>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.45s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(25px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

img {
  user-select: none;
}

button,
a {
  transition: all 0.3s ease;
}

section {
  animation: fadeUp 0.6s ease;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  h1 {
    font-size: 3rem;
  }

  h2 {
    font-size: 2.2rem;
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 2.3rem;
  }

  h2 {
    font-size: 1.8rem;
  }
}
</style>
