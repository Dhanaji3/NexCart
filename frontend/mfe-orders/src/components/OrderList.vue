<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { Order } from "shared";
import { useOrdersApi } from "../composables";

const { orders, loading, error, getAll } = useOrdersApi();

async function fetchOrders() {
  await getAll();
}

onMounted(fetchOrders);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: "#f59e0b",
    processing: "#3b82f6",
    shipped: "#8b5cf6",
    delivered: "#42b883",
    cancelled: "#ef4444",
  };
  return colors[status] || "#888";
}
</script>

<template>
  <div class="py-4">
    <h2 class="text-2xl font-bold text-slate-900 mb-6">My Orders</h2>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-slate-500">Loading orders...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card border border-rose-200 bg-rose-50">
      <p class="text-rose-700 mb-4">{{ error }}</p>
      <button
        @click="fetchOrders()"
        class="btn-primary bg-rose-600 hover:bg-rose-700"
      >
        Retry
      </button>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="text-center py-16">
      <span class="block text-5xl mb-4">📦</span>
      <h3 class="text-lg font-semibold text-slate-800 mb-2">No orders yet</h3>
      <p class="text-slate-500 mb-6">
        When you place an order, it will appear here.
      </p>
      <RouterLink to="/products" class="btn-accent">Start Shopping</RouterLink>
    </div>

    <!-- Orders -->
    <div v-else class="space-y-4">
      <div v-for="order in orders" :key="order.id" class="card">
        <div
          class="flex justify-between items-center mb-4 pb-4 border-b border-slate-100"
        >
          <div>
            <span class="font-semibold text-slate-900 mr-3">{{
              order.id
            }}</span>
            <span class="text-sm text-slate-500">{{
              formatDate(order.createdAt)
            }}</span>
            <span class="text-sm text-slate-500 ml-2"
              >({{ order.items.length }} item{{
                order.items.length !== 1 ? "s" : ""
              }})</span
            >
          </div>
          <span
            class="badge capitalize"
            :class="{
              'bg-slate-100 text-slate-700': order.status === 'pending',
              'bg-indigo-100 text-indigo-700': order.status === 'processing',
              'bg-emerald-100 text-emerald-700': order.status === 'shipped',
              'bg-green-100 text-green-700': order.status === 'delivered',
              'bg-rose-100 text-rose-700': order.status === 'cancelled',
            }"
          >
            {{ order.status }}
          </span>
        </div>

        <div class="flex flex-col gap-3 mb-4">
          <div
            v-for="item in order.items"
            :key="item.product.id"
            class="flex items-center gap-4"
          >
            <img
              :src="item.product.image"
              :alt="item.product.name"
              class="w-12 h-12 rounded-md object-cover"
            />
            <div class="flex-1 flex flex-col">
              <span class="text-sm text-slate-800">{{
                item.product.name
              }}</span>
              <span class="text-xs text-slate-500"
                >Qty: {{ item.quantity }}</span
              >
            </div>
            <span class="font-semibold text-slate-800"
              >${{ (item.product.price * item.quantity).toFixed(2) }}</span
            >
          </div>
        </div>

        <div
          class="flex justify-between items-center pt-4 border-t border-slate-100"
        >
          <div>
            <span class="text-slate-500 mr-2">Total:</span>
            <span class="font-bold text-lg text-slate-900"
              >${{ Number(order.total ?? 0).toFixed(2) }}</span
            >
          </div>
          <RouterLink :to="`/orders/${order.id}`" class="btn-outline text-sm"
            >View Details</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>
