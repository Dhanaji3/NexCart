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
</script>

<template>
  <div class="max-w-xl mx-auto">
    <div v-if="auth.loading" class="text-center py-16 text-slate-500">
      <div class="inline-flex items-center gap-3">
        <span
          class="w-5 h-5 border-2 border-slate-300 border-t-primary-500 rounded-full animate-spin"
        />
        <span>Loading profile...</span>
      </div>
    </div>

    <div v-else-if="!auth.user" class="text-center py-16 text-slate-500">
      No profile data available. Please log in again.
    </div>

    <div v-else>
      <!-- Profile Header -->
      <div class="flex items-center gap-6 mb-8">
        <img
          :src="auth.user.avatar"
          alt="Avatar"
          class="w-20 h-20 rounded-full border-3 border-emerald-500"
        />
        <div>
          <h2 class="text-xl font-bold text-slate-900 mb-1">
            {{ auth.user.name }}
          </h2>
          <p
            class="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase"
            :class="
              auth.user.role === 'admin'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            "
          >
            {{ auth.user.role }}
          </p>
        </div>
      </div>

      <!-- Profile Card -->
      <div class="card bg-white rounded-xl shadow-elevated p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold text-slate-900">
            Profile Information
          </h3>
          <button
            v-if="!isEditing"
            @click="isEditing = true"
            class="btn-outline"
          >
            Edit
          </button>
          <button
            v-else
            @click="saveProfile"
            class="btn-primary"
            :disabled="loading"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save</span>
          </button>
        </div>

        <!-- View Mode -->
        <div v-if="!isEditing" class="space-y-0">
          <div
            class="flex justify-between py-3 border-b border-slate-100 last:border-b-0"
          >
            <span class="text-sm text-slate-500">Name</span>
            <span class="text-slate-700 font-medium">{{ auth.user.name }}</span>
          </div>
          <div
            class="flex justify-between py-3 border-b border-slate-100 last:border-b-0"
          >
            <span class="text-sm text-slate-500">Email</span>
            <span class="text-slate-700 font-medium">{{
              auth.user.email
            }}</span>
          </div>
          <div class="flex justify-between py-3">
            <span class="text-sm text-slate-500">Member Since</span>
            <span class="text-slate-700 font-medium">July 2026</span>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-else class="space-y-4">
          <div>
            <label class="block text-sm text-slate-600 mb-1">Name</label>
            <input v-model="editName" type="text" class="input" />
          </div>
          <div>
            <label class="block text-sm text-slate-600 mb-1">Email</label>
            <input v-model="editEmail" type="email" class="input" />
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-3 gap-4">
        <RouterLink
          to="/orders"
          class="flex flex-col items-center gap-2 p-6 bg-white rounded-lg shadow-sm text-slate-700 font-medium text-sm no-underline hover:-translate-y-0.5 transition-transform"
        >
          <span class="text-2xl">📦</span>
          <span>My Orders</span>
        </RouterLink>
        <RouterLink
          to="/wishlist"
          class="flex flex-col items-center gap-2 p-6 bg-white rounded-lg shadow-sm text-slate-700 font-medium text-sm no-underline hover:-translate-y-0.5 transition-transform"
        >
          <span class="text-2xl">❤️</span>
          <span>Wishlist</span>
        </RouterLink>
        <button
          @click="handleLogout"
          class="flex flex-col items-center gap-2 p-6 bg-white rounded-lg shadow-sm text-slate-700 font-medium text-sm border-none cursor-pointer hover:-translate-y-0.5 hover:text-rose-500 transition-transform"
        >
          <span class="text-2xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
