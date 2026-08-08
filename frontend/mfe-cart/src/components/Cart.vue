<script setup lang="ts">
import { useCartStore } from "shared";
import { formatCurrency } from "shared";

const cart = useCartStore();
</script>

<template>
  <div class="min-h-[60vh] bg-slate-950 px-4 py-6 text-slate-100">
    <div class="mx-auto w-full max-w-300">
      <div
        class="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-[0_15px_35px_rgba(15,23,42,0.22)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-sm uppercase tracking-[0.3em] text-slate-400">
            Shopping Cart
          </p>
          <h2 class="text-3xl font-black text-white">Your Cart</h2>
        </div>
        <div
          class="inline-flex rounded-full bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-200"
        >
          {{ cart.totalItems }} item{{ cart.totalItems === 1 ? "" : "s" }}
        </div>
      </div>

      <div
        v-if="cart.items.length === 0"
        class="rounded-2xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-[0_15px_35px_rgba(15,23,42,0.2)]"
      >
        <span class="text-6xl block mb-4">🛒</span>
        <h3 class="text-2xl font-semibold text-white mb-3">
          Your cart is empty
        </h3>
        <p class="text-slate-400 mb-6">
          Add products to start building your order.
        </p>
        <RouterLink to="/products" class="btn-accent"
          >Continue Shopping</RouterLink
        >
      </div>

      <div v-else class="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
        <div class="space-y-3">
          <div
            v-for="item in cart.items"
            :key="item.product.id"
            class="rounded-2xl border border-white/10 bg-slate-900/85 p-3 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition hover:border-accent-500/40 sm:flex sm:items-center"
          >
            <img
              :src="item.product.image"
              :alt="item.product.name"
              class="h-20 w-full rounded-3xl object-cover sm:w-20"
            />

            <div class="mt-4 flex-1 space-y-3 sm:ml-4 sm:mt-0">
              <div
                class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <RouterLink
                    :to="`/products/${item.product.id}`"
                    class="block text-base font-semibold text-white hover:text-accent-300"
                  >
                    {{ item.product.name }}
                  </RouterLink>
                  <p class="text-sm text-slate-400 capitalize">
                    {{ item.product.category }}
                  </p>
                </div>
                <div class="text-sm text-slate-400 sm:text-right">
                  {{ formatCurrency(item.product.price) }} each
                </div>
              </div>

              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div
                  class="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-2 py-1"
                >
                  <button
                    @click="
                      cart.updateQuantity(item.product.id, item.quantity - 1)
                    "
                    class="h-8 w-8 rounded-full bg-slate-800 text-base font-semibold text-slate-100 transition hover:bg-slate-700"
                  >
                    −
                  </button>
                  <span
                    class="min-w-8 text-center text-sm font-semibold text-white"
                    >{{ item.quantity }}</span
                  >
                  <button
                    @click="
                      cart.updateQuantity(item.product.id, item.quantity + 1)
                    "
                    class="h-8 w-8 rounded-full bg-slate-800 text-base font-semibold text-slate-100 transition hover:bg-slate-700"
                  >
                    +
                  </button>
                </div>

                <div
                  class="flex items-center justify-between gap-3 text-sm text-slate-300 sm:justify-end"
                >
                  <span class="font-semibold text-white">{{
                    formatCurrency(item.product.price * item.quantity)
                  }}</span>
                  <button
                    @click="cart.removeFromCart(item.product.id)"
                    class="btn-ghost text-rose-400 hover:bg-rose-500/10"
                    aria-label="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside class="space-y-4">
          <div
            class="rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.18)]"
          >
            <h3 class="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div class="space-y-3 text-sm text-slate-300">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span>{{ formatCurrency(cart.totalPrice) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Shipping</span>
                <span
                  :class="
                    cart.shipping === 0
                      ? 'text-emerald-400 font-semibold'
                      : 'text-slate-300'
                  "
                >
                  {{
                    cart.shipping === 0 ? "FREE" : formatCurrency(cart.shipping)
                  }}
                </span>
              </div>
              <div
                class="border-t border-slate-700 pt-4 flex justify-between font-semibold text-white"
              >
                <span>Total</span>
                <span>{{ formatCurrency(cart.grandTotal) }}</span>
              </div>
            </div>
            <RouterLink
              to="/checkout"
              class="btn-accent w-full mt-6 text-center block"
              >Checkout</RouterLink
            >
            <button
              @click="cart.clearCart()"
              class="btn-outline w-full mt-3 border-slate-700 text-slate-200 hover:border-red-500 hover:text-rose-400"
            >
              Clear Cart
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
