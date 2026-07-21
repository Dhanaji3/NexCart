import './assets/tailwind.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useCartStore, useAuthStore } from 'shared'

const app = createApp(App)

// Global error handler for production
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error]', err)
  console.error('[Component]', instance)
  console.error('[Info]', info)
}

app.config.warnHandler = import.meta.env.PROD ? () => {} : undefined

const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

// After mount: hydrate stores from API if user is logged in
const auth = useAuthStore()
if (auth.isAuthenticated) {
  const cart = useCartStore()
  cart.fetchCart()
  cart.fetchWishlist()
}
