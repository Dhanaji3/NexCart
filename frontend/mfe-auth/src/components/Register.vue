<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "shared";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

async function handleRegister() {
  error.value = "";

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match";
    return;
  }

  if (password.value.length < 6) {
    error.value = "Password must be at least 6 characters";
    return;
  }

  loading.value = true;
  const success = await auth.register(name.value, email.value, password.value);

  if (success) {
    router.push("/");
  } else {
    error.value = "Registration failed. Please try again.";
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
        <p class="text-sm uppercase tracking-[0.3em] text-slate-500">Welcome</p>
        <h2 class="text-2xl font-bold text-white">Create Account</h2>
        <p class="text-slate-400">Join us and start shopping today.</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-3">
        <div>
          <label
            for="name"
            class="mb-2 block text-sm font-medium text-slate-300"
            >Full Name</label
          >
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Enter your name"
            required
            class="auth-input"
          />
        </div>

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
            placeholder="Create password"
            required
            class="auth-input"
          />
        </div>

        <div>
          <label
            for="confirmPassword"
            class="mb-2 block text-sm font-medium text-slate-300"
            >Confirm Password</label
          >
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm password"
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
          {{ loading ? "Creating account..." : "Create Account" }}
        </button>
      </form>

      <p class="mt-5 text-center text-sm text-slate-400">
        Already have an account?
        <RouterLink
          to="/login"
          class="font-semibold text-white transition hover:text-accent-300"
          >Sign in</RouterLink
        >
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
