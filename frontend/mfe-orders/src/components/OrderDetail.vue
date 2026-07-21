<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Order } from "shared";
import { useOrdersApi } from "../composables";

const route = useRoute();
const router = useRouter();
const { order, loading, error, getById } = useOrdersApi();

async function fetchOrder() {
  await getById(route.params.id as string);
}

onMounted(fetchOrder);

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusSteps = [
  { key: "pending", label: "Pending", icon: "🕒" },
  { key: "processing", label: "Processing", icon: "⚙️" },
  { key: "shipped", label: "Shipped", icon: "📦" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

function getStepIndex(status: string): number {
  return statusSteps.findIndex((s) => s.key === status);
}

const currentStepIndex = computed(() => {
  return order.value ? getStepIndex(order.value.status) : -1;
});

const statusLabel = computed(() => {
  if (!order.value) return "";
  const s = statusSteps.find((st) => st.key === order.value!.status);
  return s ? s.label : order.value.status;
});

const completedWidth = computed(() => {
  if (!order.value) return "0%";
  const steps = statusSteps.length - 1;
  if (steps <= 0) return "0%";
  const idx = Math.max(0, getStepIndex(order.value.status));
  const pct = (idx / steps) * 100;
  return `${pct}%`;
});
</script>

<template>
  <!-- Loading -->
  <div v-if="loading" class="text-center py-12">
    <p class="text-slate-500">Loading order...</p>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="card border border-rose-200">
    <p class="text-rose-600 mb-4">{{ error }}</p>
    <button @click="fetchOrder()" class="btn-primary">Retry</button>
  </div>

  <div v-else-if="order">
    <!-- Back link -->
    <button
      @click="router.back()"
      class="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 mb-6"
    >
      ← Back to Orders
    </button>

    <!-- Order header -->
    <div class="flex justify-between items-start mb-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Order {{ order.id }}</h2>
        <span class="text-sm text-slate-500"
          >Placed on {{ formatDate(order.createdAt) }}</span
        >
      </div>
      <span
        class="badge"
        :class="{
          'bg-slate-100 text-slate-700': order.status === 'pending',
          'bg-indigo-100 text-indigo-700': order.status === 'processing',
          'bg-emerald-100 text-emerald-700': order.status === 'shipped',
          'bg-green-100 text-green-700': order.status === 'delivered',
          'bg-rose-100 text-rose-700': order.status === 'cancelled',
        }"
      >
        {{ statusLabel }}
      </span>
    </div>

    <!-- Status Tracker -->
    <div class="card relative mb-6 p-6">
      <!-- connector: base line + progress overlay -->
      <div class="absolute inset-x-6" :style="{ top: '40%' }">
        <div class="h-0.5 bg-slate-200 w-full"></div>
        <div
          class="absolute left-0 top-0 h-0.5 bg-emerald-500"
          :style="{ width: completedWidth }"
        ></div>
      </div>
      <div class="grid grid-cols-4 items-center gap-4 relative z-10">
        <div
          v-for="(step, index) in statusSteps"
          :key="step.key"
          class="flex flex-col items-center"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
            :class="
              index < currentStepIndex
                ? 'bg-emerald-500 text-white'
                : index === currentStepIndex
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  : 'bg-slate-200 text-slate-500'
            "
          >
            <span v-if="index < currentStepIndex">✓</span>
            <span v-else>{{ step.icon }}</span>
          </div>
          <span
            class="mt-2 text-xs font-medium text-center"
            :class="
              index <= currentStepIndex ? 'text-slate-900' : 'text-slate-400'
            "
          >
            {{ step.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Tracking Info -->
    <div
      v-if="order.trackingNumber"
      class="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-4 mb-6"
    >
      <h3 class="text-sm font-semibold text-emerald-800 mb-1">📦 Tracking</h3>
      <p class="text-sm text-emerald-700">
        Tracking Number: <strong>{{ order.trackingNumber }}</strong>
      </p>
    </div>

    <!-- Grid layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left column: Order Items -->
      <div class="lg:col-span-2">
        <div class="card">
          <h3 class="text-base font-semibold text-slate-900 mb-4">
            Order Items
          </h3>
          <div class="divide-y divide-slate-100">
            <div
              v-for="item in order.items"
              :key="item.product.id"
              class="flex gap-4 py-4"
            >
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="w-16 h-16 object-cover rounded"
              />
              <div class="flex-1 flex flex-col justify-center">
                <span class="text-sm font-medium text-slate-900">{{
                  item.product.name
                }}</span>
                <span class="text-xs text-slate-500"
                  >Qty: {{ item.quantity }} × ${{
                    item.product.price.toFixed(2)
                  }}</span
                >
              </div>
              <span class="text-sm font-bold text-slate-900 self-center"
                >${{ (item.product.price * item.quantity).toFixed(2) }}</span
              >
            </div>
          </div>
          <!-- Total -->
          <div
            class="border-t pt-3 mt-2 flex justify-between font-bold text-lg text-slate-900"
          >
            <span>Order Total</span>
            <span>${{ Number(order.total ?? 0).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Right column: Summary + Shipping -->
      <div class="space-y-6">
        <!-- Shipping Address -->
        <div class="card">
          <h3 class="text-base font-semibold text-slate-900 mb-3">
            Shipping Address
          </h3>
          <div class="space-y-1">
            <p class="text-sm text-slate-500">Name</p>
            <p class="text-slate-900">{{ order.shippingAddress.fullName }}</p>
            <p class="text-sm text-slate-500 pt-2">Address</p>
            <p class="text-slate-900">{{ order.shippingAddress.street }}</p>
            <p class="text-slate-900">
              {{ order.shippingAddress.city }},
              {{ order.shippingAddress.state }}
              {{ order.shippingAddress.zipCode }}
            </p>
            <p class="text-sm text-slate-500 pt-2">Phone</p>
            <p class="text-slate-900">{{ order.shippingAddress.phone }}</p>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="card">
          <h3 class="text-base font-semibold text-slate-900 mb-3">
            Payment Method
          </h3>
          <div class="space-y-1">
            <p class="text-sm text-slate-500">Method</p>
            <p class="text-slate-900">{{ order.paymentMethod }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else class="text-center py-12">
    <h2 class="text-xl font-bold text-slate-900 mb-2">Order not found</h2>
    <RouterLink to="/orders" class="text-indigo-600 hover:text-indigo-700"
      >View all orders</RouterLink
    >
  </div>
</template>
