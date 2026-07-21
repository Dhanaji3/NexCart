<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from 'shared'
import { useRouter, useRoute } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  const success = await auth.login(email.value, password.value)

  if (success) {
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } else {
    error.value = auth.error || 'Invalid email or password'
  }
  loading.value = false
}
</script>

<template>
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="bg-white rounded-xl p-8 w-full max-w-md shadow-elevated">
      <h2 class="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
      <p class="text-slate-500 text-sm mb-6">Welcome back! Please sign in to your account.</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label for="email" class="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required class="input" />
        </div>
        <div>
          <label for="password" class="block mb-1.5 text-sm font-medium text-slate-700">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required class="input" />
        </div>

        <div v-if="error" class="text-danger-600 text-sm p-3 bg-danger-50 rounded-lg">{{ error }}</div>

        <button type="submit" :disabled="loading" class="w-full btn-primary py-3 text-base">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <p class="text-center mt-6 text-slate-500 text-sm">
        Don't have an account?
        <RouterLink to="/register" class="text-primary-600 no-underline font-medium hover:text-primary-700">Create one</RouterLink>
      </p>
      <div class="text-center mt-3 text-xs text-slate-400 italic">
        <p><strong>Demo accounts:</strong></p>
        <p>Customer: john@example.com / password123</p>
        <p>Admin: admin@vueshop.com / admin123</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
