<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useCartStore } from "shared";
import { useAuthStore } from "shared";

const cart = useCartStore();
const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-primary-950 shadow-lg">
      <nav class="max-w-7xl mx-auto w-full flex items-center px-6 py-3">
        <RouterLink
          to="/"
          class="text-white text-xl font-bold no-underline mr-8"
        >
          🛒 NexCart
        </RouterLink>
        <ul class="flex list-none gap-6 flex-1">
          <li>
            <RouterLink
              to="/products"
              class="text-slate-300 no-underline font-medium hover:text-accent-400 transition-colors [&.router-link-active]:text-accent-400"
              >Products</RouterLink
            >
          </li>
          <li>
            <RouterLink
              to="/orders"
              class="text-slate-300 no-underline font-medium hover:text-accent-400 transition-colors [&.router-link-active]:text-accent-400"
              >Orders</RouterLink
            >
          </li>
          <li v-if="auth.isAdmin">
            <RouterLink
              to="/admin"
              class="text-slate-300 no-underline font-medium hover:text-accent-400 transition-colors [&.router-link-active]:text-accent-400"
              >Admin</RouterLink
            >
          </li>
        </ul>
        <div class="flex items-center gap-4">
          <RouterLink
            to="/wishlist"
            class="no-underline text-lg relative"
            title="Wishlist"
            >❤️</RouterLink
          >
          <RouterLink
            to="/cart"
            class="no-underline text-lg relative"
            title="Cart"
          >
            🛒
            <span
              v-if="cart.totalItems > 0"
              class="absolute -top-2 -right-3 bg-danger-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold"
              >{{ cart.totalItems }}</span
            >
          </RouterLink>
          <template v-if="auth.isAuthenticated">
            <RouterLink
              to="/profile"
              class="no-underline text-lg"
              title="Profile"
              >👤</RouterLink
            >
            <button
              @click="auth.logout()"
              class="px-3 py-1.5 bg-transparent text-slate-300 border border-slate-600 rounded-md text-sm cursor-pointer hover:border-danger-500 hover:text-danger-500 transition-colors"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="px-4 py-1.5 bg-accent-500 text-white no-underline rounded-md font-medium text-sm hover:bg-accent-600 transition-colors"
              >Login</RouterLink
            >
          </template>
        </div>
      </nav>
    </header>

    <div
      v-if="auth.loading && !auth.user && auth.token"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm"
    >
      <div
        class="inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 shadow-xl"
      >
        <span
          class="w-5 h-5 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin"
        ></span>
        <span class="text-slate-700 font-medium">Loading account data...</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>
          <template #fallback>
            <div
              class="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-slate-500"
            >
              <div
                class="w-10 h-10 border-[3px] border-slate-200 border-t-primary-500 rounded-full animate-spin"
              ></div>
              <p>Loading...</p>
            </div>
          </template>
        </Suspense>
      </RouterView>
    </main>

    <!-- Footer -->
    <footer class="bg-primary-950 text-slate-400 mt-auto">
      <div
        class="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-8 border-b border-slate-700"
      >
        <div>
          <h4 class="text-white font-semibold mb-3">NexCart</h4>
          <p class="text-sm leading-relaxed">
            NexCart — your smart, fast shopping destination across ecommerce.
          </p>
        </div>
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-semibold mb-3">Quick Links</h4>
          <RouterLink
            to="/products"
            class="text-sm text-slate-400 no-underline hover:text-accent-400 transition-colors"
            >Products</RouterLink
          >
          <RouterLink
            to="/cart"
            class="text-sm text-slate-400 no-underline hover:text-accent-400 transition-colors"
            >Cart</RouterLink
          >
          <RouterLink
            to="/orders"
            class="text-sm text-slate-400 no-underline hover:text-accent-400 transition-colors"
            >Orders</RouterLink
          >
        </div>
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-semibold mb-3">Account</h4>
          <RouterLink
            to="/profile"
            class="text-sm text-slate-400 no-underline hover:text-accent-400 transition-colors"
            >Profile</RouterLink
          >
          <RouterLink
            to="/wishlist"
            class="text-sm text-slate-400 no-underline hover:text-accent-400 transition-colors"
            >Wishlist</RouterLink
          >
        </div>
      </div>
      <div class="max-w-7xl mx-auto px-6 py-4 text-center">
        <p class="text-sm text-slate-500">
          &copy; 2026 NexCart. Built for delivering a fast, modern shopping
          experience.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
