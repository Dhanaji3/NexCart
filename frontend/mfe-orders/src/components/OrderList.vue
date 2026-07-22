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
</script>

<template>
  <div class="space-y-8">
    <!-- ========================================== -->
    <!-- HERO -->
    <!-- ========================================== -->

    <section
      class="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl"
    >
      <div
        class="grid items-center gap-8 px-6 py-8 md:grid-cols-[2fr_1fr] lg:px-10"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            My Orders
          </span>

          <h1 class="mt-5 text-3xl font-bold md:text-4xl">
            Track Your Purchases
          </h1>

          <p
            class="mt-4 max-w-xl text-sm leading-7 text-slate-200 md:text-base"
          >
            View your complete order history, track deliveries, monitor shipping
            status, and manage all purchases from one place.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink
              to="/products"
              class="rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white no-underline transition hover:bg-accent-600"
            >
              Continue Shopping
            </RouterLink>
          </div>
        </div>

        <!-- Stats -->

        <div class="hidden md:block rounded-3xl bg-white/10 p-6 backdrop-blur">
          <div class="grid grid-cols-2 gap-5 text-center">
            <div>
              <h3 class="text-3xl font-bold">
                {{ orders.length }}
              </h3>

              <p class="mt-2 text-xs uppercase tracking-wider text-slate-300">
                Orders
              </p>
            </div>

            <div>
              <h3 class="text-3xl font-bold">
                {{ deliveredOrders }}
              </h3>

              <p class="mt-2 text-xs uppercase tracking-wider text-slate-300">
                Delivered
              </p>
            </div>

            <div class="col-span-2">
              <h3 class="text-3xl font-bold">${{ totalSpent.toFixed(2) }}</h3>

              <p class="mt-2 text-xs uppercase tracking-wider text-slate-300">
                Total Spent
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================== -->
    <!-- LOADING -->
    <!-- ========================================== -->

    <div v-if="loading" class="grid gap-6">
      <div
        v-for="i in 4"
        :key="i"
        class="animate-pulse rounded-3xl bg-white p-6 shadow-card"
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
      class="rounded-3xl bg-white py-20 text-center shadow-card"
    >
      <div class="mx-auto max-w-md">
        <div class="text-6xl">😕</div>

        <h2 class="mt-5 text-2xl font-bold text-slate-900">
          Unable to load orders
        </h2>

        <p class="mt-3 text-slate-500">
          {{ error }}
        </p>

        <button
          @click="fetchOrders"
          class="mt-8 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
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
      class="rounded-3xl bg-white py-24 text-center shadow-card"
    >
      <div class="mx-auto max-w-lg">
        <div class="text-7xl">📦</div>

        <h2 class="mt-6 text-3xl font-bold text-slate-900">No Orders Yet</h2>

        <p class="mx-auto mt-4 max-w-md text-slate-500">
          Looks like you haven't placed any orders yet. Start shopping to see
          your order history here.
        </p>

        <RouterLink
          to="/products"
          class="mt-8 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white no-underline transition hover:bg-primary-700"
        >
          Start Shopping
        </RouterLink>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- ORDERS LIST -->
    <!-- ========================================== -->

    <div v-else class="space-y-8">
      <article
        v-for="order in orders"
        :key="order.id"
        class="overflow-hidden rounded-3xl bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        <!-- ================================= -->
        <!-- ORDER HEADER -->
        <!-- ================================= -->

        <div class="border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div
            class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-[0.3em] text-primary-600"
              >
                Order ID
              </p>

              <h3 class="mt-1 text-lg font-bold text-slate-900">
                #{{ order.id }}
              </h3>

              <p class="mt-2 text-sm text-slate-500">
                Ordered on
                {{ formatDate(order.createdAt) }}
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <span
                class="rounded-full px-4 py-2 text-sm font-semibold capitalize"
                :class="statusClass(order.status)"
              >
                {{ order.status }}
              </span>

              <div class="text-right">
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <h3 class="text-2xl font-bold text-primary-700">
                  ${{ Number(order.total ?? 0).toFixed(2) }}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <!-- ================================= -->
        <!-- ORDER ITEMS -->
        <!-- ================================= -->

        <div class="space-y-4 p-6">
          <div
            v-for="item in order.items"
            :key="item.product.id"
            class="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 transition hover:border-primary-300 hover:bg-slate-50 sm:flex-row sm:items-center"
          >
            <!-- IMAGE -->

            <img
              :src="item.product.image"
              :alt="item.product.name"
              class="h-24 w-24 rounded-xl bg-slate-100 object-contain p-3"
            />

            <!-- DETAILS -->

            <div class="flex-1">
              <h4 class="text-lg font-semibold text-slate-900">
                {{ item.product.name }}
              </h4>

              <p class="mt-2 text-sm text-slate-500">
                Quantity :
                <span class="font-semibold">
                  {{ item.quantity }}
                </span>
              </p>

              <p class="mt-1 text-sm text-slate-500">
                Unit Price :
                <span class="font-semibold">
                  ${{ item.product.price.toFixed(2) }}
                </span>
              </p>
            </div>

            <!-- PRICE -->

            <div class="text-left sm:text-right">
              <p class="text-xs uppercase tracking-wider text-slate-400">
                Subtotal
              </p>

              <h4 class="mt-1 text-xl font-bold text-slate-900">
                ${{ (item.product.price * item.quantity).toFixed(2) }}
              </h4>
            </div>
          </div>
        </div>

        <!-- ================================= -->
        <!-- ORDER SUMMARY -->
        <!-- ================================= -->

        <div class="border-t border-slate-100 bg-slate-50 px-6 py-5">
          <div
            class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"
          >
            <div class="flex flex-wrap gap-6">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Items
                </p>

                <h4 class="font-semibold text-slate-900">
                  {{ order.items.length }}
                </h4>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <h4 class="font-semibold capitalize text-slate-900">
                  {{ order.status }}
                </h4>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <RouterLink
                :to="`/orders/${order.id}`"
                class="rounded-xl border border-primary-600 px-5 py-3 text-sm font-semibold text-primary-600 no-underline transition hover:bg-primary-600 hover:text-white"
              >
                View Details
              </RouterLink>

              <RouterLink
                to="/products"
                class="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white no-underline transition hover:bg-primary-700"
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
