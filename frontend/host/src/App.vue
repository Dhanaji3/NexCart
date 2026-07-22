<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { useCartStore } from "shared";
import { useAuthStore } from "shared";

const cart = useCartStore();
const auth = useAuthStore();

const mobileMenu = ref(false);

const toggleMenu = () => {
  mobileMenu.value = !mobileMenu.value;
};

const closeMenu = () => {
  mobileMenu.value = false;
};

const logout = () => {
  auth.logout();
  closeMenu();
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- ================= HEADER ================= -->
    <header class="sticky top-0 z-50 bg-primary-950 shadow-lg">
      <nav
        class="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3"
      >
        <!-- Logo -->
        <RouterLink to="/" class="text-white text-2xl font-bold no-underline">
          🛒 NexCart
        </RouterLink>

        <!-- Desktop Navigation -->
        <ul class="hidden md:flex list-none gap-6 flex-1 ml-10">
          <li>
            <RouterLink
              to="/products"
              class="text-slate-300 hover:text-accent-400 transition-colors"
            >
              Products
            </RouterLink>
          </li>

          <li>
            <RouterLink
              to="/orders"
              class="text-slate-300 hover:text-accent-400 transition-colors"
            >
              Orders
            </RouterLink>
          </li>

          <li v-if="auth.isAdmin">
            <RouterLink
              to="/admin"
              class="text-slate-300 hover:text-accent-400 transition-colors"
            >
              Admin
            </RouterLink>
          </li>
        </ul>

        <!-- Desktop Right -->
        <div class="hidden md:flex items-center gap-4">
          <RouterLink to="/wishlist" class="text-xl relative"> ❤️ </RouterLink>

          <RouterLink to="/cart" class="text-xl relative">
            🛒

            <span
              v-if="cart.totalItems > 0"
              class="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center"
            >
              {{ cart.totalItems }}
            </span>
          </RouterLink>

          <template v-if="auth.isAuthenticated">
            <RouterLink to="/profile" class="text-xl"> 👤 </RouterLink>

            <button
              @click="auth.logout()"
              class="px-3 py-1 border rounded text-white hover:bg-red-600"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="rounded bg-accent-500 px-4 py-2 text-white transition hover:bg-accent-600"
              active-class="bg-accent-500 text-white"
            >
              Login
            </RouterLink>
          </template>
        </div>

        <!-- Mobile Hamburger -->
        <button class="md:hidden text-white text-3xl" @click="toggleMenu">
          ☰
        </button>
      </nav>
    </header>

    <!-- ================= MOBILE MENU ================= -->

    <Transition name="slide">
      <div
        v-if="mobileMenu"
        class="fixed inset-0 bg-black/40 z-50"
        @click.self="closeMenu"
      >
        <div class="absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Menu</h2>

            <button @click="closeMenu" class="text-3xl">×</button>
          </div>

          <nav class="flex flex-col gap-5">
            <RouterLink to="/" @click="closeMenu"> 🏠 Home </RouterLink>

            <RouterLink to="/products" @click="closeMenu">
              📦 Products
            </RouterLink>

            <RouterLink to="/orders" @click="closeMenu"> 📜 Orders </RouterLink>

            <RouterLink to="/wishlist" @click="closeMenu">
              ❤️ Wishlist
            </RouterLink>

            <RouterLink to="/cart" @click="closeMenu">
              🛒 Cart ({{ cart.totalItems }})
            </RouterLink>

            <RouterLink
              v-if="auth.isAuthenticated"
              to="/profile"
              @click="closeMenu"
            >
              👤 Profile
            </RouterLink>

            <RouterLink v-if="auth.isAdmin" to="/admin" @click="closeMenu">
              ⚙️ Admin
            </RouterLink>

            <RouterLink
              v-if="!auth.isAuthenticated"
              to="/login"
              @click="closeMenu"
              class="bg-blue-600 text-white rounded px-4 py-2 text-center"
            >
              Login
            </RouterLink>

            <button
              v-if="auth.isAuthenticated"
              @click="logout"
              class="bg-red-600 text-white rounded px-4 py-2"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </Transition>

    <!-- Loading Overlay -->

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

        <span class="text-slate-700 font-medium">
          Loading account data...
        </span>
      </div>
    </div>

    <!-- Main Content -->

    <main class="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
      <RouterView v-slot="{ Component }">
        <Suspense>
          <template #default>
            <component :is="Component" />
          </template>

          <template #fallback>
            <div class="flex justify-center items-center min-h-[40vh]">
              <div
                class="w-10 h-10 border-4 border-slate-300 border-t-primary-500 rounded-full animate-spin"
              ></div>
            </div>
          </template>
        </Suspense>
      </RouterView>
    </main>
    <!-- ================= FOOTER ================= -->

    <footer class="bg-primary-950 text-slate-400 mt-auto">
      <div
        class="max-w-7xl mx-auto px-4 md:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr] gap-8 border-b border-slate-700"
      >
        <!-- About -->
        <div>
          <h4 class="text-white font-semibold mb-3">NexCart</h4>

          <p class="text-sm leading-relaxed">
            NexCart — your smart, fast shopping destination for modern
            ecommerce. Shop securely with a seamless experience across all
            devices.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-semibold mb-3">Quick Links</h4>

          <RouterLink
            to="/products"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Products
          </RouterLink>

          <RouterLink
            to="/cart"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Cart
          </RouterLink>

          <RouterLink
            to="/orders"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Orders
          </RouterLink>
        </div>

        <!-- Account -->
        <div class="flex flex-col gap-2">
          <h4 class="text-white font-semibold mb-3">Account</h4>

          <RouterLink
            to="/profile"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Profile
          </RouterLink>

          <RouterLink
            to="/wishlist"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Wishlist
          </RouterLink>

          <RouterLink
            v-if="!auth.isAuthenticated"
            to="/login"
            class="text-sm hover:text-accent-400 transition-colors"
          >
            Login
          </RouterLink>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 md:px-6 py-4 text-center">
        <p class="text-sm text-slate-500">
          © 2026 NexCart. All Rights Reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style>
/* ================= Mobile Drawer Animation ================= */

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
}

.slide-enter-from .absolute,
.slide-leave-to .absolute {
  transform: translateX(100%);
}

.slide-enter-to .absolute,
.slide-leave-from .absolute {
  transform: translateX(0);
}

.absolute {
  transition: transform 0.3s ease;
}

/* ================= Loading Spinner ================= */

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ================= Router Links ================= */

.router-link-active {
  color: rgb(96 165 250);
  font-weight: 600;
}

/* ================= Mobile Improvements ================= */

@media (max-width: 768px) {
  nav {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  footer {
    text-align: center;
  }

  footer .flex {
    align-items: center;
  }
}
</style>
