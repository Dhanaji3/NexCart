<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "shared";
import { useRouter, useRoute } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function handleLogin() {
  error.value = "";
  loading.value = true;

  const success = await auth.login(email.value, password.value);

  if (success) {
    const redirect = (route.query.redirect as string) || "/";
    router.push(redirect);
  } else {
    error.value = auth.error || "Invalid email or password";
  }
  loading.value = false;
}
</script>

<template>
  <div class="min-h-[70vh] bg-slate-950 px-4 py-8 text-slate-100">
    <div
      class="mx-auto w-full max-w-md rounded-4xl border border-white/10 bg-slate-900/90 p-5 shadow-[0_25px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl"
    >
      <div class="mb-5 space-y-2">
        <p class="text-sm uppercase tracking-[0.3em] text-slate-500">
          Welcome back
        </p>
        <h2 class="text-2xl font-bold text-white">Sign In</h2>
        <p class="text-slate-400">Access your account and continue shopping.</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-3">
        <div>
          <label
            for="email"
            class="mb-2 block text-sm font-medium text-slate-300"
            >Email</label
          >
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            class="auth-input"
          />
        </div>

        <div>
          <label
            for="password"
            class="mb-2 block text-sm font-medium text-slate-300"
            >Password</label
          >
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Enter your password"
            required
            class="auth-input"
          />
        </div>

        <div
          v-if="error"
          class="rounded-3xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-400/20"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-3xl bg-accent-500 px-5 py-2.5 text-base font-semibold text-white shadow-lg shadow-accent-500/20 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Signing in..." : "Sign In" }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-400">
        Don't have an account?
        <RouterLink
          to="/register"
          class="font-semibold text-white transition hover:text-accent-300"
        >
          Create one
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-input {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(226, 232, 240, 0.12);
  background: rgba(15, 23, 42, 0.9);
  color: #e2e8f0;
  padding: 0.75rem 0.95rem;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.auth-input::placeholder {
  color: rgba(148, 163, 184, 0.7);
}

.auth-input:focus {
  border-color: rgba(56, 189, 248, 0.9);
  box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.15);
  background: rgba(15, 23, 42, 1);
}
</style>
