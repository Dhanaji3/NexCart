<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { RouterView, RouterLink, useRoute, useRouter } from "vue-router";

import {
  ShoppingCart,
  Heart,
  Search,
  Menu,
  X,
  House,
  Package,
  Receipt,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
} from "lucide-vue-next";

import { useAuthStore, useCartStore } from "shared";

const auth = useAuthStore();
const cart = useCartStore();

const router = useRouter();
const route = useRoute();

/* ============================================================
   STATE
============================================================ */

const mobileMenu = ref(false);
const profileMenu = ref(false);

/* ============================================================
   MENUS
============================================================ */

const menus = computed(() => {
  const items = [
    {
      name: "Home",
      path: "/",
      icon: House,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: Receipt,
    },
  ];

  if (auth.isAdmin) {
    items.push({
      name: "Admin",
      path: "/admin",
      icon: LayoutDashboard,
    });
  }

  return items;
});

/* ============================================================
   ACTIVE MENU
============================================================ */

const isActive = (path: string) => {
  if (path === "/") {
    return route.path === "/";
  }

  return route.path.startsWith(path);
};

/* ============================================================
   SEARCH
============================================================ */

const search = ref("");

function onSearch() {
  if (!search.value.trim()) {
    router.push("/products");
    return;
  }

  router.push({
    path: "/products",
    query: {
      search: search.value,
    },
  });
}

/* ============================================================
   PROFILE
============================================================ */

function toggleProfile() {
  profileMenu.value = !profileMenu.value;
}

function closeProfile() {
  profileMenu.value = false;
}

/* ============================================================
   MOBILE MENU
============================================================ */

function toggleMenu() {
  mobileMenu.value = !mobileMenu.value;
}

function closeMenu() {
  mobileMenu.value = false;
}

/* ============================================================
   LOGOUT
============================================================ */

function logout() {
  closeMenu();
  closeProfile();

  auth.logout();

  router.push("/login");
}

/* ============================================================
   SCROLL
============================================================ */

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============================================================
   CLOSE MENUS ON ROUTE CHANGE
============================================================ */

router.afterEach(() => {
  mobileMenu.value = false;
  profileMenu.value = false;
});

/* ============================================================
   CLICK OUTSIDE PROFILE
============================================================ */

function handleClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  if (!target.closest(".profile-dropdown")) {
    profileMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", handleClick);
});

/* ============================================================
   USER INITIAL
============================================================ */

const userInitial = computed(() => {
  return auth.user?.name?.charAt(0).toUpperCase() || "U";
});

/* ============================================================
   USER NAME
============================================================ */

const userName = computed(() => {
  return auth.user?.name || "Guest";
});

/* ============================================================
   USER ROLE
============================================================ */

const userRole = computed(() => {
  return auth.isAdmin ? "Administrator" : "Customer";
});
</script>
<template>
  <div class="min-h-screen bg-[#0B1120]">
    <!-- ================= HEADER ================= -->

    <header
      class="sticky top-0 z-50 border-b border-white/10 bg-[#0B1120]/90 backdrop-blur-xl"
    >
      <div
        class="mx-auto flex min-h-[74px] max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8"
      >
        <!-- ================================================= -->
        <!-- Logo -->
        <!-- ================================================= -->

        <RouterLink to="/" class="flex items-center gap-3 no-underline">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-lg shadow-cyan-500/30"
          >
            <ShoppingCart class="h-6 w-6 text-white" />
          </div>

          <div class="sm:block">
            <h1 class="text-2xl font-extrabold tracking-tight text-white">
              NexCart
            </h1>

            <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
              Premium Store
            </p>
          </div>
        </RouterLink>

        <!-- ================================================= -->
        <!-- Desktop Navigation -->
        <!-- ================================================= -->

        <nav
          class="hidden items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 md:flex"
        >
          <RouterLink
            v-for="item in menus"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 no-underline"
            :class="
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            "
          >
            <component :is="item.icon" class="h-4 w-4" />

            {{ item.name }}
          </RouterLink>
        </nav>

        <!-- ================================================= -->
        <!-- Right Side -->
        <!-- ================================================= -->

        <div class="flex flex-1 min-w-0 items-center justify-end gap-3">
          <!-- Search -->

          <div class="relative hidden min-w-0 md:block md:max-w-[280px]">
            <Search
              class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />

            <input
              v-model="search"
              @keyup.enter="onSearch"
              type="text"
              placeholder="Search products..."
              class="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-5 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-cyan-400 focus:bg-white/10"
            />
          </div>

          <!-- Wishlist -->

          <RouterLink
            to="/wishlist"
            class="hidden md:inline-flex relative h-11 w-11 items-center justify-center rounded-full bg-white/5 text-rose-400 transition hover:bg-rose-500 hover:text-white"
          >
            <Heart class="h-5 w-5" />

            <span
              v-if="cart.wishlist.length"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white"
            >
              {{ cart.wishlist.length }}
            </span>
          </RouterLink>

          <!-- Cart -->

          <RouterLink
            to="/cart"
            class="hidden md:inline-flex relative h-11 w-11 items-center justify-center rounded-full bg-white/5 text-cyan-400 transition hover:bg-cyan-500 hover:text-white"
          >
            <ShoppingCart class="h-5 w-5" />

            <span
              v-if="cart.totalItems"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-white"
            >
              {{ cart.totalItems }}
            </span>
          </RouterLink>

          <!-- ================= Profile ================= -->

          <div
            v-if="auth.isAuthenticated"
            class="profile-dropdown relative hidden md:block"
          >
            <button
              @click.stop="toggleProfile"
              class="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-2 py-1 transition hover:bg-white/10"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 text-sm font-bold text-white"
              >
                {{ userInitial }}
              </div>

              <div class="pr-2 text-left">
                <p class="text-sm font-semibold text-white">
                  {{ userName }}
                </p>

                <p class="text-xs text-slate-400">
                  {{ userRole }}
                </p>
              </div>

              <ChevronDown class="h-4 w-4 text-slate-400" />
            </button>

            <!-- Dropdown -->

            <Transition name="fade">
              <div
                v-if="profileMenu"
                class="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#111827] shadow-2xl"
              >
                <RouterLink
                  to="/profile"
                  class="flex items-center gap-3 px-5 py-2 text-slate-300 hover:bg-white/5 no-underline"
                >
                  <User class="h-5 w-5" />

                  Profile
                </RouterLink>

                <RouterLink
                  v-if="auth.isAdmin"
                  to="/admin"
                  class="flex items-center gap-3 px-5 py-2 text-slate-300 hover:bg-white/5 no-underline"
                >
                  <LayoutDashboard class="h-5 w-5" />

                  Admin Dashboard
                </RouterLink>

                <button
                  @click="logout"
                  class="flex w-full items-center gap-3 px-5 py-2 text-left text-red-400 hover:bg-red-500/10"
                >
                  <LogOut class="h-5 w-5" />

                  Logout
                </button>
              </div>
            </Transition>
          </div>

          <!-- Login -->

          <RouterLink
            v-else
            to="/login"
            class="hidden rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white no-underline transition hover:scale-105 md:block"
          >
            Login
          </RouterLink>

          <!-- Mobile -->

          <button
            @click="toggleMenu"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white md:hidden"
          >
            <Menu class="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
    <!-- ========================================================= -->
    <!-- MOBILE OVERLAY -->
    <!-- ========================================================= -->

    <Transition name="fade">
      <div
        v-if="mobileMenu"
        class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        @click="closeMenu"
      ></div>
    </Transition>

    <!-- ========================================================= -->
    <!-- MOBILE DRAWER -->
    <!-- ========================================================= -->

    <Transition name="slide-right">
      <aside
        v-if="mobileMenu"
        class="fixed right-0 top-0 z-50 flex h-full w-full max-w-[320px] flex-col overflow-y-auto bg-[#0F172A] shadow-2xl md:hidden"
      >
        <!-- ================= HEADER ================= -->

        <div
          class="flex items-center justify-between border-b border-white/10 px-6 py-5"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600"
            >
              <ShoppingCart class="h-5 w-5 text-white" />
            </div>

            <div>
              <h2 class="text-lg font-bold text-white">NexCart</h2>

              <p class="text-xs text-slate-400">Premium Store</p>
            </div>
          </div>

          <button
            @click="closeMenu"
            class="rounded-xl p-2 text-slate-300 hover:bg-white/10"
          >
            <X class="h-6 w-6" />
          </button>
        </div>

        <!-- ================= MENU ================= -->

        <nav class="flex-1 px-4">
          <RouterLink
            v-for="item in menus"
            :key="item.path"
            :to="item.path"
            @click="closeMenu"
            class="mb-2 flex items-center gap-4 rounded-xl px-4 py-3 no-underline transition"
            :class="
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                : 'text-slate-300 hover:bg-white/10'
            "
          >
            <component :is="item.icon" class="h-5 w-5" />

            {{ item.name }}
          </RouterLink>

          <!-- Wishlist -->

          <RouterLink
            to="/wishlist"
            @click="closeMenu"
            class="mb-2 flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 no-underline transition hover:bg-white/10"
          >
            <div class="flex items-center gap-4">
              <Heart class="h-5 w-5" />

              Wishlist
            </div>

            <span
              v-if="cart.wishlist.length"
              class="rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white"
            >
              {{ cart.wishlist.length }}
            </span>
          </RouterLink>

          <!-- Cart -->

          <RouterLink
            to="/cart"
            @click="closeMenu"
            class="mb-2 flex items-center justify-between rounded-xl px-4 py-3 text-slate-300 no-underline transition hover:bg-white/10"
          >
            <div class="flex items-center gap-4">
              <ShoppingCart class="h-5 w-5" />

              Cart
            </div>

            <span
              v-if="cart.totalItems"
              class="rounded-full bg-cyan-500 px-2 py-1 text-xs font-bold text-white"
            >
              {{ cart.totalItems }}
            </span>
          </RouterLink>

          <!-- Profile -->

          <RouterLink
            v-if="auth.isAuthenticated"
            to="/profile"
            @click="closeMenu"
            class="mb-2 flex items-center gap-4 rounded-xl px-4 py-3 text-slate-300 no-underline transition hover:bg-white/10"
          >
            <User class="h-5 w-5" />

            Profile
          </RouterLink>
        </nav>

        <div
          class="sticky bottom-0 z-20 border-t border-white/10 bg-[#0F172A] px-4 py-4 backdrop-blur-xl"
        >
          <button
            @click="closeMenu"
            class="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <X class="h-4 w-4" />
            Close Menu
          </button>
        </div>

        <!-- ================= FOOTER ================= -->

        <div class="border-t border-white/10 p-5">
          <button
            v-if="auth.isAuthenticated"
            @click="logout"
            class="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500 py-3 font-semibold text-white transition hover:bg-red-600"
          >
            <LogOut class="h-5 w-5" />

            Logout
          </button>

          <RouterLink
            v-else
            to="/login"
            @click="closeMenu"
            class="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 font-semibold text-white no-underline"
          >
            Login
          </RouterLink>
        </div>
      </aside>
    </Transition>
    <!-- ========================================================= -->
    <!-- MAIN CONTENT -->
    <!-- ========================================================= -->

    <main class="min-h-[calc(100vh-74px)]">
      <div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <RouterView />
      </div>
    </main>

    <!-- ========================================================= -->
    <!-- FOOTER -->
    <!-- ========================================================= -->

    <footer class="mt-16 border-t border-white/10 bg-[#08111F]">
      <div class="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div class="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <!-- ================================================= -->
          <!-- Company -->
          <!-- ================================================= -->

          <div>
            <div class="flex items-center gap-3">
              <div
                class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600"
              >
                <ShoppingCart class="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 class="text-2xl font-bold text-white">NexCart</h2>

                <p class="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Premium Store
                </p>
              </div>
            </div>

            <p class="mt-6 leading-7 text-slate-400">
              Experience premium online shopping with thousands of products,
              secure checkout, lightning-fast delivery and 24×7 support.
            </p>
          </div>

          <!-- ================================================= -->
          <!-- Shop -->
          <!-- ================================================= -->

          <div>
            <h3 class="mb-5 text-lg font-bold text-white">Shop</h3>

            <div class="space-y-3">
              <RouterLink
                to="/products"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                All Products
              </RouterLink>

              <RouterLink
                to="/wishlist"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Wishlist
              </RouterLink>

              <RouterLink
                to="/cart"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Shopping Cart
              </RouterLink>

              <RouterLink
                to="/orders"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Orders
              </RouterLink>
            </div>
          </div>

          <!-- ================================================= -->
          <!-- Support -->
          <!-- ================================================= -->

          <div>
            <h3 class="mb-5 text-lg font-bold text-white">Support</h3>

            <div class="space-y-3">
              <a
                href="#"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Help Center
              </a>

              <a
                href="#"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Shipping Policy
              </a>

              <a
                href="#"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Return Policy
              </a>

              <a
                href="#"
                class="block text-slate-400 no-underline transition hover:text-cyan-400"
              >
                Privacy Policy
              </a>
            </div>
          </div>

          <!-- ================================================= -->
          <!-- Contact -->
          <!-- ================================================= -->

          <div>
            <h3 class="mb-5 text-lg font-bold text-white">Contact</h3>

            <div class="space-y-4 text-slate-400">
              <p>📍 Pune, Maharashtra</p>

              <p>📧 support@nexcart.com</p>

              <p>☎ +91 98765 43210</p>
            </div>
          </div>
        </div>

        <!-- ================================================= -->
        <!-- Bottom -->
        <!-- ================================================= -->

        <div
          class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row"
        >
          <p class="text-sm text-slate-500">
            © {{ new Date().getFullYear() }}
            NexCart. All Rights Reserved.
          </p>

          <div class="flex items-center gap-5">
            <a href="#" class="text-slate-400 transition hover:text-cyan-400">
              Facebook
            </a>

            <a href="#" class="text-slate-400 transition hover:text-cyan-400">
              Instagram
            </a>

            <a href="#" class="text-slate-400 transition hover:text-cyan-400">
              Twitter
            </a>

            <a href="#" class="text-slate-400 transition hover:text-cyan-400">
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      <!-- ================================================= -->
      <!-- Back To Top -->
      <!-- ================================================= -->

      <button
        @click="scrollToTop"
        class="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl transition hover:scale-110"
      >
        ↑
      </button>
    </footer>
  </div>
</template>
