<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import type { Order } from "shared";
import { formatCurrency } from "shared";
import { useAdminOrdersApi } from "../composables";

const {
  orders,
  loading,
  error,
  getAll,
  updateStatus: apiUpdateStatus,
} = useAdminOrdersApi();

const filterStatus = ref("");
const search = ref("");

async function fetchOrders() {
  await getAll(filterStatus.value || undefined);
}

onMounted(fetchOrders);

async function updateStatus(orderId: string, newStatus: Order["status"]) {
  try {
    await apiUpdateStatus(orderId, newStatus);
  } catch (err: any) {
    alert(err.message || "Failed to update order status");
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const filteredOrders = computed(() => {
  return orders.value.filter((order) => {
    const statusMatch =
      !filterStatus.value || order.status === filterStatus.value;

    const searchMatch =
      !search.value ||
      order.id.toLowerCase().includes(search.value.toLowerCase()) ||
      order.shippingAddress.fullName
        .toLowerCase()
        .includes(search.value.toLowerCase());

    return statusMatch && searchMatch;
  });
});

/* Dashboard Statistics */

const totalRevenue = computed(() =>
  orders.value.reduce((sum, o) => sum + o.total, 0),
);

const pendingOrders = computed(
  () => orders.value.filter((o) => o.status === "pending").length,
);

const deliveredOrders = computed(
  () => orders.value.filter((o) => o.status === "delivered").length,
);
</script>
<template>
  <section class="space-y-5">
    <div
      class="overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-900 to-violet-900 text-white shadow-xl"
    >
      <div
        class="flex flex-col justify-between gap-5 p-5 lg:flex-row lg:items-center lg:p-6"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em]"
          >
            NexCart Admin
          </span>

          <h1 class="mt-4 text-3xl font-bold">Orders Management</h1>

          <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Monitor customer orders, update delivery status, track revenue, and
            manage the complete order lifecycle from one dashboard.
          </p>
        </div>

        <div
          class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
        >
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <h3 class="text-2xl font-bold">{{ orders.length }}</h3>
              <p class="mt-2 text-xs uppercase tracking-widest text-slate-300">
                Orders
              </p>
            </div>

            <div>
              <h3 class="text-3xl font-bold text-emerald-300">
                ₹{{ totalRevenue.toLocaleString() }}
              </h3>
              <p class="mt-2 text-xs uppercase tracking-widest text-slate-300">
                Revenue
              </p>
            </div>

            <div>
              <h3 class="text-3xl font-bold text-yellow-300">
                {{ pendingOrders }}
              </h3>
              <p class="mt-2 text-xs uppercase tracking-widest text-slate-300">
                Pending
              </p>
            </div>

            <div>
              <h3 class="text-3xl font-bold text-green-300">
                {{ deliveredOrders }}
              </h3>
              <p class="mt-2 text-xs uppercase tracking-widest text-slate-300">
                Delivered
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-2">
      <RouterLink
        to="/admin"
        class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/80"
      >
        📊 Dashboard
      </RouterLink>

      <RouterLink
        to="/admin/products"
        class="rounded-xl border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700/80"
      >
        📦 Products
      </RouterLink>

      <RouterLink
        to="/admin/orders"
        class="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
      >
        🧾 Orders
      </RouterLink>
    </div>

    <div class="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        <input
          v-model="search"
          type="text"
          placeholder="Search Order ID or Customer..."
          class="input pl-12"
        />
      </div>

      <select v-model="filterStatus" class="input">
        <option value="">All Orders</option>
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <button @click="fetchOrders" class="btn-accent">Refresh</button>
    </div>

    <div
      v-if="loading"
      class="card flex flex-col items-center justify-center py-14"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
      ></div>

      <p class="mt-5 text-slate-500">Loading Orders...</p>
    </div>

    <div v-else-if="error" class="card text-center py-14">
      <div class="text-6xl">😕</div>

      <h2 class="mt-6 text-2xl font-bold">Something went wrong</h2>

      <p class="mt-3 text-slate-500">
        {{ error }}
      </p>

      <button @click="fetchOrders" class="btn-accent">Retry</button>
    </div>

    <template v-else>
      <div
        class="hidden overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 lg:block"
      >
        <div class="border-b border-slate-700 bg-slate-800/70 px-4 py-3">
          <h2 class="text-lg font-bold text-slate-100">Orders List</h2>
          <p class="mt-1 text-sm text-slate-400">
            {{ filteredOrders.length }} Orders Found
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead
              class="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300"
            >
              <tr>
                <th class="px-4 py-3 font-medium">Customer</th>
                <th class="px-4 py-3 font-medium">Order ID</th>
                <th class="px-4 py-3 font-medium">Date</th>
                <th class="px-4 py-3 font-medium">Items</th>
                <th class="px-4 py-3 font-medium">Amount</th>
                <th class="px-4 py-3 font-medium">Status</th>
                <th class="px-4 py-3 font-medium">Update</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                class="border-t border-slate-700/80 text-slate-200 transition hover:bg-slate-800/60"
              >
                <td class="px-4 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-violet-600 font-bold text-white"
                    >
                      {{ order.shippingAddress.fullName.charAt(0) }}
                    </div>

                    <div>
                      <h4 class="font-semibold text-slate-100">
                        {{ order.shippingAddress.fullName }}
                      </h4>

                      <p class="text-xs text-slate-400">
                        {{ order.shippingAddress.phone }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    #{{ order.id }}
                  </span>
                </td>

                <td class="px-4 py-4 text-sm text-slate-300">
                  {{ formatDate(order.createdAt) }}
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300"
                  >
                    {{ order.items.length }} Items
                  </span>
                </td>

                <td class="px-4 py-4">
                  <span class="text-lg font-bold text-emerald-300">
                    {{ formatCurrency(order.total) }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    :class="{
                      'bg-yellow-500/15 text-yellow-300':
                        order.status === 'pending',
                      'bg-blue-500/15 text-blue-300':
                        order.status === 'processing',
                      'bg-indigo-500/15 text-indigo-300':
                        order.status === 'shipped',
                      'bg-green-500/15 text-green-300':
                        order.status === 'delivered',
                      'bg-red-500/15 text-red-300':
                        order.status === 'cancelled',
                    }"
                  >
                    {{ order.status }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <select
                    :value="order.status"
                    @change="
                      updateStatus(
                        order.id,
                        ($event.target as HTMLSelectElement)
                          .value as Order['status'],
                      )
                    "
                    class="update-select input text-sm"
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

      <div class="space-y-3 lg:hidden">
        <article v-for="order in filteredOrders" :key="order.id" class="card">
          <div
            class="flex items-center justify-between border-b border-slate-100 p-4"
          >
            <div>
              <h3 class="font-bold text-slate-900">#{{ order.id }}</h3>
              <p class="mt-1 text-xs text-slate-500">
                {{ formatDate(order.createdAt) }}
              </p>
            </div>

            <span
              class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
              :class="{
                'bg-yellow-100 text-yellow-700': order.status === 'pending',
                'bg-blue-100 text-blue-700': order.status === 'processing',
                'bg-indigo-100 text-indigo-700': order.status === 'shipped',
                'bg-green-100 text-green-700': order.status === 'delivered',
                'bg-red-100 text-red-700': order.status === 'cancelled',
              }"
            >
              {{ order.status }}
            </span>
          </div>

          <div class="space-y-3 p-4">
            <div class="flex items-center gap-3">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-r from-indigo-500 to-violet-600 text-xl font-bold text-white"
              >
                {{ order.shippingAddress.fullName.charAt(0) }}
              </div>

              <div>
                <h4 class="font-semibold text-slate-900">
                  {{ order.shippingAddress.fullName }}
                </h4>
                <p class="text-sm text-slate-500">
                  {{ order.shippingAddress.phone }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Items
                </p>
                <h4 class="mt-1 font-semibold">{{ order.items.length }}</h4>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Amount
                </p>
                <h4 class="mt-1 text-lg font-bold text-emerald-600">
                  {{ formatCurrency(order.total) }}
                </h4>
              </div>
            </div>

            <select
              :value="order.status"
              @change="
                updateStatus(
                  order.id,
                  ($event.target as HTMLSelectElement).value as Order['status'],
                )
              "
              class="update-select input"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </article>
      </div>

      <div v-if="filteredOrders.length === 0" class="card text-center py-16">
        <div class="text-7xl">📦</div>

        <h2 class="mt-6 text-3xl font-bold text-slate-900">No Orders Found</h2>

        <p class="mx-auto mt-4 max-w-md text-slate-500">
          There are no orders matching the selected filters.
        </p>

        <button
          @click="
            search = '';
            filterStatus = '';
            fetchOrders();
          "
          class="mt-6 btn-accent"
        >
          Reset Filters
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 12px rgba(15, 23, 42, 0.04);
}

.input {
  width: 100%;
  border: 1px solid rgb(226 232 240);
  background: white;
  border-radius: 14px;
  padding: 0.85rem 1rem;
  outline: none;
  transition: 0.25s;
}

.update-select {
  border: 1px solid rgba(148, 163, 184, 0.45);
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.08);
}

.update-select:hover {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(96, 165, 250, 0.9);
  color: #f8fafc;
}

.update-select:focus {
  border-color: rgba(96, 165, 250, 0.9);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.18);
  background: rgba(15, 23, 42, 0.9);
}

.input:focus {
  border-color: rgb(79 70 229);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.12);
}

table {
  border-collapse: collapse;
}

tbody tr {
  transition: 0.25s;
}

tbody tr:hover {
  background: #f8fafc;
}

button,
select,
a {
  transition: all 0.25s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

select {
  cursor: pointer;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.shadow-card,
article,
table {
  animation: fadeUp 0.45s ease;
}

::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

@media (max-width: 1024px) {
  .lg\\:block {
    display: none;
  }
}

@media (min-width: 1025px) {
  .lg\\:hidden {
    display: none;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .grid {
    gap: 1rem;
  }

  .rounded-3xl {
    border-radius: 1.25rem;
  }
}
</style>
