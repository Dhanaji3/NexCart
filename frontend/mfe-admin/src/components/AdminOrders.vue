<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import type { Order } from "shared";
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

const processingOrders = computed(
  () => orders.value.filter((o) => o.status === "processing").length,
);

const deliveredOrders = computed(
  () => orders.value.filter((o) => o.status === "delivered").length,
);
</script>
<template>
  <section class="space-y-8">
    <!-- ================================================= -->
    <!-- HERO -->
    <!-- ================================================= -->

    <div
      class="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-900 text-white shadow-2xl"
    >
      <div
        class="flex flex-col justify-between gap-8 p-8 lg:flex-row lg:items-center lg:p-10"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
          >
            NexCart Admin
          </span>

          <h1 class="mt-5 text-4xl font-bold">Orders Management</h1>

          <p class="mt-4 max-w-2xl text-slate-300 leading-7">
            Monitor customer orders, update delivery status, track revenue, and
            manage the complete order lifecycle from one dashboard.
          </p>
        </div>

        <div
          class="rounded-3xl bg-white/10 p-6 backdrop-blur-xl border border-white/10"
        >
          <div class="grid grid-cols-2 gap-8 text-center">
            <div>
              <h3 class="text-3xl font-bold">
                {{ orders.length }}
              </h3>

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

    <!-- ================================================= -->
    <!-- ADMIN NAVIGATION -->
    <!-- ================================================= -->

    <div class="rounded-3xl bg-white p-4 shadow-card">
      <div class="flex flex-wrap gap-3">
        <RouterLink
          to="/admin"
          class="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          📊 Dashboard
        </RouterLink>

        <RouterLink
          to="/admin/products"
          class="rounded-xl px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          📦 Products
        </RouterLink>

        <RouterLink
          to="/admin/orders"
          class="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg"
        >
          🧾 Orders
        </RouterLink>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- FILTERS -->
    <!-- ================================================= -->

    <div class="rounded-3xl bg-white p-6 shadow-card">
      <div class="grid gap-4 lg:grid-cols-[2fr_1fr_auto]">
        <!-- Search -->

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

        <!-- Status -->

        <select v-model="filterStatus" class="input">
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          @click="fetchOrders"
          class="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- ================================================= -->
    <!-- LOADING -->
    <!-- ================================================= -->

    <div
      v-if="loading"
      class="flex flex-col items-center justify-center rounded-3xl bg-white py-24 shadow-card"
    >
      <div
        class="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
      ></div>

      <p class="mt-5 text-slate-500">Loading Orders...</p>
    </div>

    <!-- ================================================= -->
    <!-- ERROR -->
    <!-- ================================================= -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-white py-24 text-center shadow-card"
    >
      <div class="text-6xl">😕</div>

      <h2 class="mt-6 text-2xl font-bold">Something went wrong</h2>

      <p class="mt-3 text-slate-500">
        {{ error }}
      </p>

      <button
        @click="fetchOrders"
        class="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white"
      >
        Retry
      </button>
    </div>

    <!-- PART 2 STARTS HERE -->

    <template v-else
      ><!-- ================================================= -->
      <!-- DESKTOP TABLE -->
      <!-- ================================================= -->

      <div
        class="hidden overflow-hidden rounded-3xl bg-white shadow-card lg:block"
      >
        <div class="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <h2 class="text-lg font-bold text-slate-900">Orders List</h2>

          <p class="mt-1 text-sm text-slate-500">
            {{ filteredOrders.length }} Orders Found
          </p>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50">
                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Customer
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Order ID
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Date
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Items
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Amount
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Status
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Update
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="order in filteredOrders"
                :key="order.id"
                class="border-b border-slate-100 transition hover:bg-slate-50"
              >
                <!-- Customer -->

                <td class="px-6 py-5">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 font-bold text-white"
                    >
                      {{ order.shippingAddress.fullName.charAt(0) }}
                    </div>

                    <div>
                      <h4 class="font-semibold text-slate-900">
                        {{ order.shippingAddress.fullName }}
                      </h4>

                      <p class="text-xs text-slate-500">
                        {{ order.shippingAddress.email }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Order -->

                <td class="px-6 py-5">
                  <span
                    class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold"
                  >
                    #{{ order.id }}
                  </span>
                </td>

                <!-- Date -->

                <td class="px-6 py-5 text-sm text-slate-600">
                  {{ formatDate(order.createdAt) }}
                </td>

                <!-- Items -->

                <td class="px-6 py-5">
                  <span
                    class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {{ order.items.length }} Items
                  </span>
                </td>

                <!-- Total -->

                <td class="px-6 py-5">
                  <span class="text-lg font-bold text-emerald-600">
                    ₹{{ order.total.toLocaleString() }}
                  </span>
                </td>

                <!-- Status -->

                <td class="px-6 py-5">
                  <span
                    class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                    :class="{
                      'bg-yellow-100 text-yellow-700':
                        order.status === 'pending',
                      'bg-blue-100 text-blue-700':
                        order.status === 'processing',
                      'bg-indigo-100 text-indigo-700':
                        order.status === 'shipped',
                      'bg-green-100 text-green-700':
                        order.status === 'delivered',
                      'bg-red-100 text-red-700': order.status === 'cancelled',
                    }"
                  >
                    {{ order.status }}
                  </span>
                </td>

                <!-- Update -->

                <td class="px-6 py-5">
                  <select
                    :value="order.status"
                    @change="
                      updateStatus(
                        order.id,
                        ($event.target as HTMLSelectElement)
                          .value as Order['status'],
                      )
                    "
                    class="input text-sm"
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

      <!-- ================================================= -->
      <!-- MOBILE CARDS -->
      <!-- ================================================= -->

      <div class="space-y-5 lg:hidden">
        <article
          v-for="order in filteredOrders"
          :key="order.id"
          class="overflow-hidden rounded-3xl bg-white shadow-card"
        >
          <!-- Header -->

          <div
            class="flex items-center justify-between border-b border-slate-100 p-5"
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

          <!-- Body -->

          <div class="space-y-4 p-5">
            <div class="flex items-center gap-4">
              <div
                class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-xl font-bold text-white"
              >
                {{ order.shippingAddress.fullName.charAt(0) }}
              </div>

              <div>
                <h4 class="font-semibold text-slate-900">
                  {{ order.shippingAddress.fullName }}
                </h4>

                <p class="text-sm text-slate-500">
                  {{ order.shippingAddress.email }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Items
                </p>

                <h4 class="mt-1 font-semibold">
                  {{ order.items.length }}
                </h4>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Amount
                </p>

                <h4 class="mt-1 text-lg font-bold text-emerald-600">
                  ₹{{ order.total.toLocaleString() }}
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
              class="input"
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

      <!-- PART 3 STARTS HERE -->
      <!-- ================================================= -->
      <!-- EMPTY STATE -->
      <!-- ================================================= -->

      <div
        v-if="filteredOrders.length === 0"
        class="rounded-3xl bg-white py-24 text-center shadow-card"
      >
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
          class="mt-8 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
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
