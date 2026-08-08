<script setup lang="ts">
import { ref, watch } from "vue";
import { useAuthStore } from "shared";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const isEditing = ref(false);
const editName = ref("");
const editEmail = ref("");
const loading = ref(false);

watch(
  () => auth.user,
  (user) => {
    if (user && !isEditing.value) {
      editName.value = user.name;
      editEmail.value = user.email;
    }
  },
  { immediate: true },
);

async function saveProfile() {
  loading.value = true;
  const success = await auth.updateProfile({
    name: editName.value,
    email: editEmail.value,
  });
  if (success) {
    isEditing.value = false;
  }
  loading.value = false;
}

function handleLogout() {
  auth.logout();
  router.push("/login");
}

if (!auth.isAuthenticated) {
  router.push("/login");
}
const memberSince = new Date().toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
});
</script>

<template>
  <div class="space-y-6">
    <!-- ========================================= -->
    <!-- HERO -->
    <!-- ========================================= -->

    <section
      class="overflow-hidden rounded-2xl bg-linear-to-r from-primary-950 via-primary-900 to-primary-800 text-white shadow-[0_20px_50px_rgba(15,23,42,0.28)]"
    >
      <div
        class="grid items-center gap-5 px-5 py-5 md:grid-cols-[2fr_1fr] lg:px-6"
      >
        <!-- Left -->

        <div class="flex flex-col gap-6 sm:flex-row sm:items-center">
          <img
            :src="auth.user?.avatar"
            alt="Avatar"
            class="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg"
          />

          <div class="space-y-3">
            <span
              class="inline-flex rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200"
            >
              My Account
            </span>

            <div class="space-y-2">
              <h1 class="text-3xl font-bold sm:text-4xl">
                {{ auth.user?.name }}
              </h1>

              <p class="text-sm text-slate-200/90">
                {{ auth.user?.email }}
              </p>
            </div>

            <div
              class="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100"
            >
              <span
                class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-100"
              >
                ✔
              </span>
              Verified Member
            </div>
          </div>
        </div>

        <!-- Right -->

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            class="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10"
          >
            <h3 class="text-2xl font-bold text-white">{{ auth.user?.role }}</h3>
            <p
              class="mt-2 text-xs uppercase tracking-[0.3em] text-slate-200/80"
            >
              Role
            </p>
          </div>
          <div
            class="rounded-2xl bg-white/10 p-4 backdrop-blur ring-1 ring-white/10"
          >
            <h3 class="text-2xl font-bold text-white">{{ memberSince }}</h3>
            <p
              class="mt-2 text-xs uppercase tracking-[0.3em] text-slate-200/80"
            >
              Member Since
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-5 lg:grid-cols-[2fr_1fr]">
      <!-- ========================================= -->
      <!-- PROFILE INFORMATION -->
      <!-- ========================================= -->

      <div class="card p-5">
        <div
          class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h2 class="text-2xl font-bold text-slate-900">
              Profile Information
            </h2>
            <p class="mt-1 text-sm text-slate-500">
              Manage your personal information.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="btn-outline px-4 py-2"
            >
              ✏ Edit Profile
            </button>

            <template v-else>
              <button @click="isEditing = false" class="btn-outline px-4 py-2">
                Cancel
              </button>

              <button
                @click="saveProfile"
                :disabled="loading"
                class="btn-accent px-4 py-2"
              >
                {{ loading ? "Saving..." : "Save Changes" }}
              </button>
            </template>
          </div>
        </div>

        <!-- ========================================= -->
        <!-- VIEW MODE -->
        <!-- ========================================= -->

        <div v-if="!isEditing" class="grid gap-4">
          <div
            class="rounded-[1.75rem] bg-slate-50 p-5 sm:grid sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p class="text-sm text-slate-500">👤 Full Name</p>
              <h4 class="mt-2 text-lg font-semibold text-slate-900">
                {{ auth.user?.name }}
              </h4>
            </div>
          </div>

          <div
            class="rounded-[1.75rem] bg-slate-50 p-5 sm:grid sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p class="text-sm text-slate-500">✉ Email Address</p>
              <h4 class="mt-2 text-lg font-semibold text-slate-900">
                {{ auth.user?.email }}
              </h4>
            </div>
          </div>

          <div
            class="rounded-[1.75rem] bg-slate-50 p-5 sm:grid sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p class="text-sm text-slate-500">🛡 Account Role</p>
              <span
                class="mt-2 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                {{ auth.user?.role }}
              </span>
            </div>
          </div>

          <div
            class="rounded-[1.75rem] bg-slate-50 p-5 sm:grid sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p class="text-sm text-slate-500">📅 Member Since</p>
              <h4 class="mt-2 text-lg font-semibold text-slate-900">
                {{ memberSince }}
              </h4>
            </div>
          </div>
        </div>

        <!-- ========================================= -->
        <!-- EDIT MODE -->
        <!-- ========================================= -->

        <div v-else class="space-y-6">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600"
              >Full Name</label
            >
            <input
              v-model="editName"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 focus:bg-white"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-600"
              >Email Address</label
            >
            <input
              v-model="editEmail"
              type="email"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-primary-500 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <!-- ========================================= -->
      <!-- ACCOUNT OVERVIEW -->
      <!-- ========================================= -->

      <aside class="space-y-4">
        <div class="card p-4">
          <h3 class="mb-4 text-xl font-bold text-slate-900">
            Account Overview
          </h3>

          <div class="space-y-4 text-sm text-slate-600">
            <div class="flex justify-between">
              <span>Status</span>
              <span class="font-semibold text-emerald-600">Active</span>
            </div>

            <div class="flex justify-between">
              <span>Member Since</span>
              <span class="font-semibold">{{ memberSince }}</span>
            </div>

            <div class="flex justify-between">
              <span>Role</span>
              <span class="capitalize font-semibold">{{
                auth.user?.role
              }}</span>
            </div>
          </div>
        </div>

        <!-- ========================================= -->
        <!-- QUICK ACTIONS -->
        <!-- ========================================= -->

        <div class="rounded-4xl bg-white p-6 shadow-card">
          <h3 class="mb-5 text-xl font-bold text-slate-900">Quick Actions</h3>

          <div class="grid gap-4">
            <RouterLink
              to="/orders"
              class="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 no-underline transition hover:border-primary-500 hover:bg-primary-50"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl"
                >
                  📦
                </div>
                <div>
                  <h4 class="font-semibold text-slate-900">My Orders</h4>
                  <p class="text-sm text-slate-500">View your order history</p>
                </div>
              </div>
              <span
                class="text-xl text-slate-400 transition group-hover:translate-x-1"
                >→</span
              >
            </RouterLink>

            <RouterLink
              to="/wishlist"
              class="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 no-underline transition hover:border-pink-500 hover:bg-pink-50"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-2xl"
                >
                  ❤️
                </div>
                <div>
                  <h4 class="font-semibold text-slate-900">Wishlist</h4>
                  <p class="text-sm text-slate-500">Your saved products</p>
                </div>
              </div>
              <span
                class="text-xl text-slate-400 transition group-hover:translate-x-1"
                >→</span
              >
            </RouterLink>

            <button
              @click="handleLogout"
              class="group flex w-full items-center justify-between rounded-2xl border border-red-200 p-4 text-left transition hover:bg-red-50"
            >
              <div class="flex items-center gap-4">
                <div
                  class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-2xl"
                >
                  🚪
                </div>
                <div>
                  <h4 class="font-semibold text-slate-900">Logout</h4>
                  <p class="text-sm text-slate-500">
                    Sign out from your account
                  </p>
                </div>
              </div>
              <span
                class="text-xl text-red-400 transition group-hover:translate-x-1"
                >→</span
              >
            </button>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>

<style scoped>
.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 10px rgba(15, 23, 42, 0.04);
}

button,
a,
input {
  transition: all 0.25s ease;
}

input:focus {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

img {
  user-select: none;
  transition: transform 0.35s ease;
}

img:hover {
  transform: scale(1.05);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section,
aside,
.shadow-card {
  animation: fadeUp 0.45s ease forwards;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }
}
</style>
