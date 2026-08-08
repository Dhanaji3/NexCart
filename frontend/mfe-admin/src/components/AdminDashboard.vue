<script setup lang="ts">
import { onMounted } from "vue";
import { useAdminStatsApi } from "../composables";

const { stats, loading, error, fetchStats } = useAdminStatsApi();

onMounted(fetchStats);

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
}
</script>

<template>
  <div class="space-y-5">
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <h2 class="text-3xl font-bold text-white">Admin Dashboard</h2>

      <nav class="flex flex-wrap gap-2">
        <RouterLink
          to="/admin"
          class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
        >
          Overview
        </RouterLink>
        <RouterLink
          to="/admin/products"
          class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/80"
        >
          Products
        </RouterLink>
        <RouterLink
          to="/admin/orders"
          class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/80"
        >
          Orders
        </RouterLink>
      </nav>
    </div>

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 py-16 text-slate-300"
    >
      <div
        class="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-400/30 border-t-indigo-400"
      ></div>
      <p>Loading dashboard...</p>
    </div>

    <div
      v-else-if="error"
      class="space-y-4 rounded-2xl border border-rose-500/30 bg-slate-900/70 p-6 text-center text-slate-200"
    >
      <p class="text-rose-400">{{ error }}</p>
      <button @click="fetchStats()" class="btn-primary px-4 py-2">Retry</button>
    </div>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div class="card p-4! text-center">
          <div class="mb-2 text-3xl">💰</div>
          <div class="text-3xl font-bold text-emerald-600">
            {{ formatCurrency(stats.totalRevenue) }}
          </div>
          <div class="mt-1 text-sm text-slate-500">Total Revenue</div>
        </div>

        <div class="card p-4! text-center">
          <div class="mb-2 text-3xl">📦</div>
          <div class="text-3xl font-bold text-indigo-600">
            {{ stats.totalOrders }}
          </div>
          <div class="mt-1 text-sm text-slate-500">Total Orders</div>
        </div>

        <div class="card p-4! text-center">
          <div class="mb-2 text-3xl">🏷️</div>
          <div class="text-3xl font-bold text-indigo-500">
            {{ stats.totalProducts }}
          </div>
          <div class="mt-1 text-sm text-slate-500">Total Products</div>
        </div>

        <div class="card p-4! text-center">
          <div class="mb-2 text-3xl">👥</div>
          <div class="text-3xl font-bold text-slate-700">
            {{ stats.totalUsers }}
          </div>
          <div class="mt-1 text-sm text-slate-500">Active Users</div>
        </div>
      </div>

      <div class="space-y-3">
        <h3 class="text-lg font-semibold text-slate-100">Quick Actions</h3>
        <div class="flex flex-wrap gap-3">
          <RouterLink
            to="/admin/products"
            class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            ➕ Add Product
          </RouterLink>
          <RouterLink
            to="/admin/orders"
            class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            📋 Manage Orders
          </RouterLink>
        </div>
      </div>

      <div
        class="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70"
      >
        <div
          class="flex items-center justify-between border-b border-slate-700 px-4 py-3"
        >
          <h3 class="text-xl font-bold text-slate-100">Recent Orders</h3>
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
          >
            {{ stats.recentOrders.length }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full min-w-160 text-left">
            <thead
              class="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300"
            >
              <tr>
                <th class="px-3 py-3 font-medium">Order ID</th>
                <th class="px-3 py-3 font-medium">Items</th>
                <th class="px-3 py-3 font-medium">Total</th>
                <th class="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in stats.recentOrders"
                :key="order.id"
                class="border-t border-slate-700/80 text-sm text-slate-200"
              >
                <td class="px-3 py-3 font-semibold text-slate-100">
                  {{ order.id }}
                </td>
                <td class="px-3 py-3">{{ order.items.length }} item(s)</td>
                <td class="px-3 py-3 font-semibold text-slate-100">
                  ₹{{ order.total.toFixed(2) }}
                </td>
                <td class="px-3 py-3">
                  <span
                    class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize"
                    :class="{
                      'bg-amber-100 text-amber-800': order.status === 'pending',
                      'bg-blue-100 text-blue-800':
                        order.status === 'processing',
                      'bg-violet-100 text-violet-800':
                        order.status === 'shipped',
                      'bg-emerald-100 text-emerald-800':
                        order.status === 'delivered',
                      'bg-rose-100 text-rose-800': order.status === 'cancelled',
                    }"
                  >
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>
