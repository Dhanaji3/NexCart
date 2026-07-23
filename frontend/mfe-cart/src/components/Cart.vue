<script setup lang="ts">
import { useCartStore } from "shared";

const cart = useCartStore();
</script>

<template>
  <div class="py-4">
    <h2 class="text-2xl font-bold text-slate-900 mb-6">Shopping Cart</h2>

    <div v-if="cart.items.length === 0" class="text-center py-16 card">
      <span class="text-6xl block mb-4">🛒</span>
      <h3 class="text-xl font-semibold text-slate-700 mb-2">
        Your cart is empty
      </h3>
      <p class="text-slate-500 mb-6">Add some products to get started!</p>
      <RouterLink to="/products" class="btn-accent"
        >Continue Shopping</RouterLink
      >
    </div>

    <div v-else class="flex flex-col lg:flex-row gap-8">
      <div class="flex-1 flex flex-col gap-4">
        <div
          v-for="item in cart.items"
          :key="item.product.id"
          class="card flex flex-row items-center gap-4 p-4"
        >
          <img
            :src="item.product.image"
            :alt="item.product.name"
            class="w-20 h-20 object-cover rounded-lg"
          />
          <div class="flex-1 flex flex-col gap-0.5">
            <RouterLink
              :to="`/products/${item.product.id}`"
              class="font-medium text-slate-700 text-sm no-underline hover:text-indigo-600"
            >
              {{ item.product.name }}
            </RouterLink>
            <span class="text-xs text-slate-400 capitalize">{{
              item.product.category
            }}</span>
            <span class="text-sm text-slate-500"
              >₹{{ item.product.price.toFixed(2) }}</span
            >
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="cart.updateQuantity(item.product.id, item.quantity - 1)"
              class="w-8 h-8 border border-slate-200 rounded bg-white flex items-center justify-center cursor-pointer text-base hover:border-indigo-500"
            >
              −
            </button>
            <span class="font-semibold min-w-[1.5rem] text-center">{{
              item.quantity
            }}</span>
            <button
              @click="cart.updateQuantity(item.product.id, item.quantity + 1)"
              class="w-8 h-8 border border-slate-200 rounded bg-white flex items-center justify-center cursor-pointer text-base hover:border-indigo-500"
            >
              +
            </button>
          </div>
          <div class="font-bold text-slate-900 min-w-[5rem] text-right">
            ₹{{ (item.product.price * item.quantity).toFixed(2) }}
          </div>
          <button
            @click="cart.removeFromCart(item.product.id)"
            class="btn-ghost text-rose-500 hover:bg-rose-50 hover:text-rose-600 w-8 h-8 rounded-full flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      <div class="lg:w-80">
        <div class="card p-6 sticky top-24">
          <h3 class="text-lg font-bold text-slate-900 mb-4">Order Summary</h3>
          <div class="space-y-3">
            <div class="flex justify-between text-slate-600 text-sm">
              <span>Subtotal ({{ cart.totalItems }} items)</span>
              <span>₹{{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-slate-600 text-sm">
              <span>Shipping</span>
              <span
                :class="
                  cart.shipping === 0 ? 'text-emerald-600 font-semibold' : ''
                "
              >
                {{
                  cart.shipping === 0 ? "FREE" : `₹${cart.shipping.toFixed(2)}`
                }}
              </span>
            </div>
            <div
              class="flex justify-between border-t border-slate-200 pt-4 mt-2 font-bold text-lg text-slate-900"
            >
              <span>Total</span>
              <span>₹{{ cart.grandTotal.toFixed(2) }}</span>
            </div>
          </div>
          <RouterLink
            to="/checkout"
            class="btn-accent w-full mt-6 text-center block"
            >Proceed to Checkout</RouterLink
          >
          <button
            @click="cart.clearCart()"
            class="btn-outline w-full mt-3 text-sm text-slate-500 hover:border-rose-500 hover:text-rose-500"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
