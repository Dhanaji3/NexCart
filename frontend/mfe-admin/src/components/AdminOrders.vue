<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Order } from 'shared'
import { useAdminOrdersApi } from '../composables'

const { orders, loading, error, getAll, updateStatus: apiUpdateStatus } = useAdminOrdersApi()
const filterStatus = ref('')

async function fetchOrders() {
  await getAll(filterStatus.value || undefined)
}

onMounted(fetchOrders)

async function updateStatus(orderId: string, newStatus: Order['status']) {
  try {
    await apiUpdateStatus(orderId, newStatus)
  } catch (err: any) {
    alert('Failed to update status: ' + (err.message || 'Unknown error'))
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const filteredOrders = computed(() => {
  if (!filterStatus.value) return orders.value
  return orders.value.filter(o => o.status === filterStatus.value)
})
</script>

<template>
  <div class="py-4">
    <!-- Page title + nav -->
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-slate-900">Manage Orders</h2>
      <div class="flex gap-2">
        <RouterLink to="/admin" class="px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Overview</RouterLink>
        <RouterLink to="/admin/products" class="px-4 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">Products</RouterLink>
        <RouterLink to="/admin/orders" class="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white">Orders</RouterLink>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-3 mb-6">
      <select v-model="filterStatus" class="input" @change="fetchOrders()">
        <option value="">All Orders</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12 text-slate-500">
      <div class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"></div>
      <p>Loading orders...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center py-12">
      <p class="text-rose-600 mb-4">{{ error }}</p>
      <button @click="fetchOrders()" class="btn-primary">Retry</button>
    </div>

    <!-- Orders table -->
    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50">
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Order ID</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Date</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Customer</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Items</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Total</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Status</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in filteredOrders" :key="order.id" class="border-b border-slate-100">
            <td class="px-4 py-3 font-semibold text-slate-900">{{ order.id }}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(order.createdAt) }}</td>
            <td class="px-4 py-3 text-sm text-slate-700">{{ order.shippingAddress.fullName }}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ order.items.length }} item(s)</td>
            <td class="px-4 py-3 font-semibold text-emerald-600">${{ order.total.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <span
                class="badge capitalize"
                :class="{
                  'bg-slate-100 text-slate-700': order.status === 'pending',
                  'bg-indigo-100 text-indigo-700': order.status === 'processing',
                  'bg-emerald-100 text-emerald-700': order.status === 'shipped',
                  'bg-green-100 text-green-700': order.status === 'delivered',
                  'bg-rose-100 text-rose-700': order.status === 'cancelled',
                }"
              >{{ order.status }}</span>
            </td>
            <td class="px-4 py-3 min-w-[140px]">
              <select
                :value="order.status"
                @change="updateStatus(order.id, ($event.target as HTMLSelectElement).value as Order['status'])"
                class="btn-ghost text-sm cursor-pointer"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
