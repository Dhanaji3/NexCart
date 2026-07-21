<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AdminStats } from 'shared'
import { useAdminStatsApi } from '../composables'

const { stats, loading, error, fetchStats } = useAdminStatsApi()

onMounted(fetchStats)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
</script>

<template>
  <div class="py-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
      <h2 class="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
      <nav class="flex gap-2">
        <RouterLink to="/admin" class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white">Overview</RouterLink>
        <RouterLink to="/admin/products" class="px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Products</RouterLink>
        <RouterLink to="/admin/orders" class="px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Orders</RouterLink>
      </nav>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 text-slate-500">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p>Loading dashboard...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card text-center py-10">
      <p class="text-rose-600 mb-4">{{ error }}</p>
      <button @click="fetchStats()" class="btn-primary">Retry</button>
    </div>

    <template v-else-if="stats">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <div class="text-3xl mb-2">💰</div>
          <div class="text-3xl font-bold text-emerald-600">{{ formatCurrency(stats.totalRevenue) }}</div>
          <div class="text-sm text-slate-500 mt-1">Total Revenue</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">📦</div>
          <div class="text-3xl font-bold text-indigo-600">{{ stats.totalOrders }}</div>
          <div class="text-sm text-slate-500 mt-1">Total Orders</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">🏷️</div>
          <div class="text-3xl font-bold text-indigo-500">{{ stats.totalProducts }}</div>
          <div class="text-sm text-slate-500 mt-1">Total Products</div>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">👥</div>
          <div class="text-3xl font-bold text-slate-700">{{ stats.totalUsers }}</div>
          <div class="text-sm text-slate-500 mt-1">Active Users</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h3>
        <div class="flex gap-3">
          <RouterLink to="/admin/products" class="btn-outline">➕ Add Product</RouterLink>
          <RouterLink to="/admin/orders" class="btn-outline">📋 Manage Orders</RouterLink>
        </div>
      </div>

      <!-- Recent Orders -->
      <div class="card">
        <h3 class="text-lg font-semibold text-slate-900 mb-4">Recent Orders</h3>
        <table class="w-full">
          <thead>
            <tr class="bg-slate-50">
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-2">Order ID</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-2">Items</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-2">Total</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wide px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in stats.recentOrders" :key="order.id" class="border-b border-slate-100">
              <td class="py-3 px-3 font-semibold text-slate-900">{{ order.id }}</td>
              <td class="py-3 px-3 text-slate-600">{{ order.items.length }} item(s)</td>
              <td class="py-3 px-3 font-semibold text-slate-900">${{ order.total.toFixed(2) }}</td>
              <td class="py-3 px-3">
                <span
                  class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                  :class="{
                    'bg-amber-100 text-amber-800': order.status === 'pending',
                    'bg-blue-100 text-blue-800': order.status === 'processing',
                    'bg-violet-100 text-violet-800': order.status === 'shipped',
                    'bg-emerald-100 text-emerald-800': order.status === 'delivered',
                    'bg-rose-100 text-rose-800': order.status === 'cancelled'
                  }"
                >{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
