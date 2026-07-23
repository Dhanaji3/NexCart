<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useHomeApi } from "../composables";
import { useCartStore } from "shared";
import type { Product } from "shared";
import { useRouter } from "vue-router";

const router = useRouter();

const { featuredProducts, categories, loading, fetchHome } = useHomeApi();

/* ---------------- Hero ---------------- */

const activeSlide = ref(0);
const cart = useCartStore();

const heroSlides = computed(() => featuredProducts.value.slice(0, 5));

const featuredGridProducts = computed(() => featuredProducts.value.slice(0, 8));

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

const startCarousel = () => {
  stopCarousel();

  if (heroSlides.value.length <= 1) return;

  carouselTimer = setInterval(() => {
    nextSlide();
  }, 4500);
};

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
};

/* ---------------- Swipe ---------------- */

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
function addToCart(product: Product) {
  cart.addToCart(product);
}

const buyNow = (product: Product) => {
  if (!product.inStock) return;

  // Don't add duplicate items
  if (!cart.isInCart(product.id)) {
    cart.addToCart(product);
  }

  router.push("/checkout");
};

onMounted(async () => {
  await fetchHome();
  startCarousel();
});

onBeforeUnmount(() => {
  stopCarousel();
});
</script>
<template>
  <div class="flex flex-col gap-12">
    <!-- ================= HERO SECTION ================= -->

    <section
      class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-primary-950 to-primary-900 shadow-xl"
      @mouseenter="pauseHero"
      @mouseleave="resumeHero"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Background -->

      <div
        class="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-accent-500/10 blur-3xl"
      />

      <div
        class="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-primary-400/10 blur-3xl"
      />

      <div
        v-if="heroSlides.length"
        class="relative min-h-[260px] md:min-h-[340px] lg:min-h-[390px]"
      >
        <Transition name="fade" mode="out-in">
          <div
            :key="heroSlides[activeSlide].id"
            class="grid h-full items-center gap-8 px-6 py-8 md:grid-cols-2 lg:px-12"
          >
            <!-- LEFT -->

            <div class="max-w-lg">
              <span
                class="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent-300"
              >
                New Collection
              </span>

              <h1
                class="mt-5 text-3xl font-extrabold leading-tight text-white md:text-4xl lg:text-5xl"
              >
                {{ heroSlides[activeSlide].name }}
              </h1>

              <p
                class="mt-4 max-w-md text-sm leading-7 text-slate-300 md:text-base"
              >
                Premium quality products with secure payment, lightning-fast
                delivery and trusted service.
              </p>

              <div class="mt-7 flex flex-wrap gap-3">
                <RouterLink
                  :to="`/products/${heroSlides[activeSlide].id}`"
                  class="rounded-lg bg-accent-500 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-accent-600"
                >
                  Buy Now
                </RouterLink>

                <RouterLink
                  to="/products"
                  class="rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-white/10"
                >
                  Explore
                </RouterLink>
              </div>
            </div>

            <!-- RIGHT -->

            <div class="hidden justify-center md:flex">
              <img
                :src="heroSlides[activeSlide].image"
                :alt="heroSlides[activeSlide].name"
                class="h-60 w-auto object-contain transition duration-500 hover:scale-105 lg:h-72"
              />
            </div>
          </div>
        </Transition>

        <!-- Previous -->

        <button
          @click="prevSlide"
          class="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
        >
          ❮
        </button>

        <!-- Next -->

        <button
          @click="nextSlide"
          class="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:flex"
        >
          ❯
        </button>

        <!-- Indicators -->

        <div class="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
          <button
            v-for="(slide, index) in heroSlides"
            :key="slide.id"
            @click="goToSlide(index)"
            class="h-2 rounded-full transition-all duration-300"
            :class="activeSlide === index ? 'w-8 bg-white' : 'w-2 bg-white/40'"
          />
        </div>
      </div>

      <div
        v-else
        class="flex min-h-[320px] flex-col items-center justify-center text-center"
      >
        <h1 class="text-4xl font-bold text-white">Welcome to NexCart</h1>

        <p class="mt-4 text-slate-300">Shop smarter with premium products.</p>

        <RouterLink
          to="/products"
          class="mt-6 rounded-lg bg-accent-500 px-6 py-3 font-semibold text-white no-underline"
        >
          Shop Now
        </RouterLink>
      </div>
    </section>
    <!-- ================= SHOP BY CATEGORY ================= -->

    <section class="space-y-6">
      <!-- Heading -->

      <div class="flex items-center justify-between">
        <div>
          <span
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600"
          >
            Browse
          </span>

          <h2 class="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
            Shop by Category
          </h2>
        </div>

        <RouterLink
          to="/products"
          class="hidden md:inline-flex items-center gap-2 text-primary-600 font-semibold no-underline hover:text-primary-700"
        >
          View All →
        </RouterLink>
      </div>

      <!-- Categories -->

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <RouterLink
          v-for="cat in categories"
          :key="cat.id"
          :to="`/products?category=${cat.slug}`"
          class="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl no-underline"
        >
          <!-- Hover Background -->

          <div
            class="absolute inset-0 bg-gradient-to-br from-primary-50 to-accent-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          <div class="relative z-10 flex flex-col items-center">
            <!-- Icon -->

            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary-100"
            >
              {{ cat.icon }}
            </div>

            <!-- Name -->

            <h3 class="mt-4 text-center text-sm font-semibold text-slate-800">
              {{ cat.name }}
            </h3>

            <!-- Explore -->

            <span
              class="mt-2 text-xs text-primary-600 opacity-0 transition-all duration-300 group-hover:opacity-100"
            >
              Explore →
            </span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- ================= PROMOTIONAL BANNER ================= -->

    <section
      class="overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 via-primary-600 to-accent-500"
    >
      <div class="grid items-center gap-6 px-6 py-8 md:grid-cols-2 lg:px-10">
        <!-- Left -->

        <div>
          <span
            class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white"
          >
            Limited Offer
          </span>

          <h2 class="mt-4 text-2xl font-bold text-white md:text-3xl">
            Up to 50% OFF
          </h2>

          <p class="mt-3 max-w-md text-sm leading-6 text-primary-100">
            Save more on selected products. Shop today before the offer ends.
          </p>

          <RouterLink
            to="/products"
            class="mt-6 inline-flex rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary-700 no-underline transition hover:bg-slate-100"
          >
            Shop Deals
          </RouterLink>
        </div>

        <!-- Right -->

        <div class="hidden justify-end md:flex">
          <div class="rounded-2xl bg-white/10 px-8 py-8 backdrop-blur">
            <div class="grid grid-cols-2 gap-5 text-center text-white">
              <div>
                <h3 class="text-3xl font-bold">5K+</h3>

                <p class="text-xs uppercase tracking-widest">Products</p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">25K+</h3>

                <p class="text-xs uppercase tracking-widest">Customers</p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">99%</h3>

                <p class="text-xs uppercase tracking-widest">Positive</p>
              </div>

              <div>
                <h3 class="text-3xl font-bold">24/7</h3>

                <p class="text-xs uppercase tracking-widest">Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= FEATURED PRODUCTS ================= -->

    <section class="space-y-6">
      <!-- Heading -->

      <div class="flex items-center justify-between">
        <div>
          <span
            class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600"
          >
            Popular
          </span>

          <h2 class="mt-1 text-2xl md:text-3xl font-bold text-slate-900">
            Featured Products
          </h2>
        </div>

        <RouterLink
          to="/products"
          class="hidden md:inline-flex items-center gap-2 font-semibold text-primary-600 no-underline hover:text-primary-700"
        >
          View All →
        </RouterLink>
      </div>

      <!-- Loading -->

      <div v-if="loading" class="flex justify-center py-16">
        <div
          class="h-10 w-10 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"
        ></div>
      </div>

      <!-- Product Grid -->

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <article
          v-for="product in featuredGridProducts"
          :key="product.id"
          class="group overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- Image -->

          <div class="relative overflow-hidden bg-slate-100">
            <!-- Discount -->

            <span
              class="absolute left-3 top-3 z-10 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              SALE
            </span>

            <!-- Wishlist -->

            <button
              class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-500 hover:text-white"
            >
              ♡
            </button>

            <!-- Image -->

            <img
              :src="product.image"
              :alt="product.name"
              class="mx-auto h-52 w-full object-contain p-5 transition duration-500 group-hover:scale-110"
            />
          </div>

          <!-- Content -->

          <div class="p-5">
            <!-- Rating -->

            <div class="mb-2 flex items-center justify-between">
              <span
                class="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700"
              >
                ⭐ {{ product.rating }}
              </span>

              <span class="text-xs text-green-600 font-medium"> In Stock </span>
            </div>

            <!-- Name -->

            <h3
              class="line-clamp-2 min-h-[48px] text-base font-semibold text-slate-800"
            >
              {{ product.name }}
            </h3>

            <!-- Price -->

            <div class="mt-4 flex items-end justify-between">
              <div>
                <span class="text-2xl font-bold text-accent-600">
                  ₹{{ product.price.toFixed(2) }}
                </span>

                <p class="text-xs text-slate-400 line-through">
                  ₹{{ (product.price * 1.2).toFixed(2) }}
                </p>
              </div>
            </div>

            <!-- Buttons -->

            <!-- <div class="mt-5 grid grid-cols-2 gap-3">
              <button
                @click="addToCart(product)"
                :disabled="!product.inStock"
                class="rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
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
                class="rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 no-underline transition hover:border-accent-600 hover:text-accent-600"
              >
                View
              </RouterLink>
            </div> -->
            <div class="mt-5 space-y-3">
              <!-- Buy Now -->

              <button
                @click="buyNow(product)"
                :disabled="!product.inStock"
                class="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:bg-gray-300"
              >
                ⚡ Buy Now
              </button>

              <!-- Bottom Buttons -->

              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="addToCart(product)"
                  :disabled="!product.inStock"
                  class="rounded-lg bg-accent-600 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-700"
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
                  class="rounded-lg border border-slate-300 py-2.5 text-center text-sm font-semibold text-slate-700 no-underline transition hover:border-accent-600 hover:text-accent-600"
                >
                  View Details
                </RouterLink>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Mobile Button -->

      <div class="text-center md:hidden">
        <RouterLink
          to="/products"
          class="inline-flex rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          View All Products
        </RouterLink>
      </div>
    </section>
    <!-- ================= WHY CHOOSE NEXCART ================= -->

    <section class="space-y-6">
      <!-- Heading -->

      <div class="text-center">
        <span
          class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600"
        >
          Why Choose Us
        </span>

        <h2 class="mt-2 text-2xl md:text-3xl font-bold text-slate-900">
          Shopping Made Better
        </h2>

        <p class="mx-auto mt-3 max-w-2xl text-sm text-slate-500 md:text-base">
          Everything you need for a secure, fast and enjoyable shopping
          experience.
        </p>
      </div>

      <!-- Cards -->

      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div
          class="group rounded-2xl bg-white p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-3xl transition group-hover:scale-110"
          >
            🚚
          </div>

          <h3 class="mt-4 text-base font-semibold text-slate-900">
            Fast Delivery
          </h3>

          <p class="mt-2 text-sm text-slate-500">
            Free shipping on eligible orders.
          </p>
        </div>

        <div
          class="group rounded-2xl bg-white p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl transition group-hover:scale-110"
          >
            🔒
          </div>

          <h3 class="mt-4 text-base font-semibold">Secure Payment</h3>

          <p class="mt-2 text-sm text-slate-500">
            Safe checkout using trusted payment methods.
          </p>
        </div>

        <div
          class="group rounded-2xl bg-white p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100 text-3xl transition group-hover:scale-110"
          >
            ↩️
          </div>

          <h3 class="mt-4 text-base font-semibold">Easy Returns</h3>

          <p class="mt-2 text-sm text-slate-500">
            Hassle-free return policy within 30 days.
          </p>
        </div>

        <div
          class="group rounded-2xl bg-white p-5 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div
            class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-3xl transition group-hover:scale-110"
          >
            💬
          </div>

          <h3 class="mt-4 text-base font-semibold">24×7 Support</h3>

          <p class="mt-2 text-sm text-slate-500">
            Friendly customer support whenever you need it.
          </p>
        </div>
      </div>
    </section>

    <!-- ================= NEWSLETTER ================= -->

    <section
      class="overflow-hidden rounded-2xl bg-gradient-to-r from-primary-700 to-primary-600"
    >
      <div class="grid items-center gap-8 px-6 py-8 md:grid-cols-2 lg:px-10">
        <!-- Left -->

        <div>
          <span
            class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white"
          >
            Newsletter
          </span>

          <h2 class="mt-4 text-2xl md:text-3xl font-bold text-white">
            Never Miss Our Best Deals
          </h2>

          <p class="mt-3 text-sm leading-6 text-primary-100">
            Subscribe to receive exclusive offers, new arrivals and special
            discounts.
          </p>
        </div>

        <!-- Right -->

        <div class="flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            class="flex-1 rounded-xl border border-white/20 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300"
          />

          <button
            class="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>

    <!-- ================= FINAL CTA ================= -->

    <section class="rounded-2xl bg-white p-8 shadow-card">
      <div
        class="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left"
      >
        <div>
          <h2 class="text-2xl font-bold text-slate-900">
            Ready to Start Shopping?
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            Discover premium products at unbeatable prices with NexCart.
          </p>
        </div>

        <RouterLink
          to="/products"
          class="rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          Explore Products →
        </RouterLink>
      </div>
    </section>
  </div>
</template>
