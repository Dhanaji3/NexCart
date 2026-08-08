<script setup lang="ts">
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useOrdersApi } from "../composables";

const { orders, loading, error, getAll } = useOrdersApi();

async function fetchOrders() {
  await getAll();
}

onMounted(fetchOrders);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const totalSpent = computed(() =>
  orders.value.reduce((sum, order) => sum + Number(order.total ?? 0), 0),
);

const deliveredOrders = computed(
  () => orders.value.filter((o) => o.status === "delivered").length,
);

function statusClass(status: string) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "shipped":
      return "bg-violet-100 text-violet-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-rose-100 text-rose-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function formatPrice(value: number | string) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
</script>

<template>
  <div class="mx-auto max-w-300 px-4 py-6 space-y-6">
    <!-- ========================================== -->
    <!-- HERO -->
    <!-- ========================================== -->

    <section
      class="overflow-hidden rounded-3xl bg-[#0c1427]/95 text-white shadow-xl shadow-black/20"
    >
      <div
        class="grid items-center gap-4 px-5 py-5 md:grid-cols-[2fr_1fr] lg:px-8"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200"
          >
            My Orders
          </span>

          <h1 class="mt-4 text-2xl font-black md:text-3xl text-white">
            Track Your Purchases
          </h1>

          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-300 md:text-sm">
            View your order history, track deliveries, monitor shipment status,
            and manage all purchases from a single dashboard.
          </p>

          <div class="mt-6 flex flex-wrap gap-3">
            <RouterLink
              to="/products"
              class="inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
            >
              Continue Shopping
            </RouterLink>
          </div>
        </div>

        <div
          class="rounded-3xl bg-white/5 p-4 shadow-inner shadow-slate-950/10 backdrop-blur"
        >
          <div class="grid grid-cols-2 gap-4 text-center">
            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                Orders
              </p>
              <h3 class="mt-3 text-2xl font-black text-white">
                {{ orders.length }}
              </h3>
            </div>

            <div>
              <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                Delivered
              </p>
              <h3 class="mt-3 text-2xl font-black text-white">
                {{ deliveredOrders }}
              </h3>
            </div>

            <div class="col-span-2 rounded-2xl bg-slate-950/80 p-4">
              <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                Total Spent
              </p>
              <h3 class="mt-2 text-xl font-black text-white">
                {{ formatPrice(totalSpent) }}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- LOADING -->
    <!-- ========================================== -->

    <div v-if="loading" class="grid gap-5">
      <div
        v-for="i in 4"
        :key="i"
        class="animate-pulse rounded-3xl bg-[#0c1427]/90 p-5 shadow-xl shadow-black/15"
      >
        <div class="mb-5 h-6 w-48 rounded bg-slate-200"></div>

        <div class="mb-3 h-4 w-full rounded bg-slate-200"></div>

        <div class="mb-3 h-4 w-2/3 rounded bg-slate-200"></div>

        <div class="mt-6 h-12 rounded-xl bg-slate-200"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- ERROR -->
    <!-- ========================================== -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-[#0c1427]/95 p-8 text-center shadow-xl shadow-black/20"
    >
      <div class="mx-auto max-w-sm">
        <div class="text-4xl">😕</div>

        <h2 class="mt-4 text-lg font-bold text-white">Unable to load orders</h2>

        <p class="mt-3 text-slate-300 text-sm">
          {{ error }}
        </p>

        <button
          @click="fetchOrders"
          class="mt-6 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- EMPTY -->
    <!-- ========================================== -->

    <div
      v-else-if="orders.length === 0"
      class="rounded-3xl bg-[#0c1427]/95 p-8 text-center shadow-xl shadow-black/20"
    >
      <div class="mx-auto max-w-sm">
        <div class="text-5xl">📦</div>

        <h2 class="mt-4 text-xl font-bold text-white">No Orders Yet</h2>

        <p class="mx-auto mt-3 max-w-sm text-slate-300 text-sm">
          Looks like you haven't placed any orders yet. Start shopping to see
          your order history here.
        </p>

        <RouterLink
          to="/products"
          class="mt-6 inline-flex rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white no-underline transition hover:-translate-y-0.5"
        >
          Start Shopping
        </RouterLink>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- ORDERS LIST -->
    <!-- ========================================== -->

    <div v-else class="space-y-6">
      <article
        v-for="order in orders"
        :key="order.id"
        class="overflow-hidden rounded-3xl border border-white/10 bg-[#0b1220]/90 shadow-xl transition duration-300 hover:-translate-y-1 hover:shadow-black/25"
      >
        <!-- ================================= -->
        <!-- ORDER HEADER -->
        <!-- ================================= -->

        <div class="border-b border-white/10 bg-white/5 px-4 py-3">
          <div
            class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p
                class="text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300"
              >
                Order ID
              </p>

              <h3 class="mt-1 text-lg font-bold text-white">#{{ order.id }}</h3>

              <p class="mt-2 text-sm text-slate-300">
                Ordered on
                {{ formatDate(order.createdAt) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <span
                class="rounded-full px-3 py-1.5 text-sm font-semibold capitalize"
                :class="statusClass(order.status)"
              >
                {{ order.status }}
              </span>

              <div class="text-right">
                <p
                  class="text-[10px] uppercase tracking-[0.35em] text-slate-400"
                >
                  Total
                </p>

                <h3 class="text-xl font-bold text-cyan-300">
                  {{ formatPrice(order.total) }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- ================================= -->
        <!-- ORDER ITEMS -->
        <!-- ================================= -->

        <div class="space-y-3 p-4">
          <div
            v-for="item in order.items"
            :key="item.product.id"
            class="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-400/40 hover:bg-white/10 sm:flex-row sm:items-center"
          >
            <!-- IMAGE -->

            <img
              :src="item.product.image"
              :alt="item.product.name"
              class="h-20 w-20 rounded-2xl bg-white/5 object-contain p-1.5"
            />

            <!-- DETAILS -->

            <div class="flex-1">
              <h4 class="text-lg font-semibold text-white">
                {{ item.product.name }}
              </h4>

              <p class="mt-2 text-sm text-slate-300">
                Quantity :
                <span class="font-semibold text-white">
                  {{ item.quantity }}
                </span>
              </p>

              <p class="mt-1 text-sm text-slate-300">
                Unit Price :
                <span class="font-semibold text-white">
                  {{ formatPrice(item.product.price) }}
                </span>
              </p>
            </div>

            <!-- PRICE -->

            <div class="text-left sm:text-right">
              <p class="text-[10px] uppercase tracking-[0.35em] text-slate-400">
                Subtotal
              </p>

              <h4 class="mt-1 text-xl font-bold text-white">
                {{ formatPrice(item.product.price * item.quantity) }}
              </h4>
            </div>
          </div>
        </div>

        <!-- ================================= -->
        <!-- ORDER SUMMARY -->
        <!-- ================================= -->

        <div class="border-t border-white/10 bg-white/5 px-4 py-3">
          <div
            class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex flex-wrap gap-4">
              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.35em] text-slate-400"
                >
                  Items
                </p>

                <h4 class="font-semibold text-white">
                  {{ order.items.length }}
                </h4>
              </div>

              <div>
                <p
                  class="text-[10px] uppercase tracking-[0.35em] text-slate-400"
                >
                  Status
                </p>

                <h4 class="font-semibold capitalize text-white">
                  {{ order.status }}
                </h4>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink
                :to="`/orders/${order.id}`"
                class="rounded-2xl border border-cyan-400/70 px-4 py-2.5 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500 hover:text-white"
              >
                View Details
              </RouterLink>

              <RouterLink
                to="/products"
                class="rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Buy Again
              </RouterLink>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 10px rgba(15, 23, 42, 0.04);
}

article {
  transition: all 0.3s ease;
}

article:hover {
  transform: translateY(-4px);
}

img {
  transition: transform 0.35s ease;
}

article:hover img {
  transform: scale(1.05);
}

button,
a {
  transition: all 0.25s ease;
}

button:hover,
a:hover {
  transform: translateY(-1px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

article {
  animation: fadeInUp 0.45s ease forwards;
}

@media (max-width: 768px) {
  article {
    border-radius: 20px;
  }

  h1 {
    font-size: 2rem;
  }
}
</style>
