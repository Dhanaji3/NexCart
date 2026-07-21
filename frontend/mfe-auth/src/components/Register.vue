<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from 'shared'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)

async function handleRegister() {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  const success = await auth.register(name.value, email.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = 'Registration failed. Please try again.'
  }
  loading.value = false
}
</script>

<template>
  <div class="flex justify-center items-center min-h-[60vh]">
    <div class="bg-white rounded-xl p-8 w-full max-w-md shadow-elevated">
      <h2 class="text-2xl font-bold text-slate-900 mb-1">Create Account</h2>
      <p class="text-slate-500 text-sm mb-6">Join us and start shopping today.</p>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="name" class="block mb-1.5 text-sm font-medium text-slate-700">Full Name</label>
          <input id="name" v-model="name" type="text" placeholder="Enter your name" required class="input" />
        </div>
        <div>
          <label for="email" class="block mb-1.5 text-sm font-medium text-slate-700">Email</label>
          <input id="email" v-model="email" type="email" placeholder="Enter your email" required class="input" />
        </div>
        <div>
          <label for="password" class="block mb-1.5 text-sm font-medium text-slate-700">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Create password" required class="input" />
        </div>
        <div>
          <label for="confirmPassword" class="block mb-1.5 text-sm font-medium text-slate-700">Confirm Password</label>
          <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="Confirm password" required class="input" />
        </div>

        <div v-if="error" class="text-danger-600 text-sm p-3 bg-danger-50 rounded-lg">{{ error }}</div>

        <button type="submit" :disabled="loading" class="w-full btn-primary py-3 text-base">
          {{ loading ? 'Creating account...' : 'Create Account' }}
        </button>
      </form>

      <p class="text-center mt-6 text-slate-500 text-sm">
        Already have an account?
        <RouterLink to="/login" class="text-primary-600 no-underline font-medium hover:text-primary-700">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
