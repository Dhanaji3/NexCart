<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useOrdersApi } from "../composables";

const route = useRoute();
const router = useRouter();

const { order, loading, error, getById } = useOrdersApi();

async function fetchOrder() {
  await getById(route.params.id as string);
}

onMounted(fetchOrder);

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
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

function getStepIndex(status: string) {
  return statusSteps.findIndex((s) => s.key === status);
}

const currentStepIndex = computed(() =>
  order.value ? getStepIndex(order.value.status) : -1,
);

const completedWidth = computed(() => {
  if (!order.value) return "0%";

  const total = statusSteps.length - 1;
  const current = Math.max(0, getStepIndex(order.value.status));

  return `${(current / total) * 100}%`;
});

function badgeClass(status: string) {
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
      return "bg-red-100 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- ====================================== -->
    <!-- LOADING -->
    <!-- ====================================== -->

    <div v-if="loading" class="rounded-3xl bg-white p-10 shadow-card">
      <div class="animate-pulse">
        <div class="mb-6 h-8 w-60 rounded bg-slate-200"></div>

        <div class="mb-4 h-4 w-full rounded bg-slate-200"></div>

        <div class="mb-4 h-4 w-3/4 rounded bg-slate-200"></div>

        <div class="mt-8 h-60 rounded-2xl bg-slate-200"></div>
      </div>
    </div>

    <!-- ====================================== -->
    <!-- ERROR -->
    <!-- ====================================== -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-white py-24 text-center shadow-card"
    >
      <div class="mx-auto max-w-md">
        <div class="text-6xl">😕</div>

        <h2 class="mt-5 text-2xl font-bold text-slate-900">
          Unable to load your order
        </h2>

        <p class="mt-3 text-slate-500">
          {{ error }}
        </p>

        <button
          @click="fetchOrder"
          class="mt-8 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- ====================================== -->
    <!-- CONTENT -->
    <!-- ====================================== -->

    <template v-else-if="order">
      <!-- Back -->

      <button
        @click="router.back()"
        class="flex items-center gap-2 text-primary-600 transition hover:text-primary-700"
      >
        ← Back to Orders
      </button>

      <!-- ====================================== -->
      <!-- HERO -->
      <!-- ====================================== -->

      <section
        class="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl"
      >
        <div class="grid items-center gap-8 px-8 py-8 md:grid-cols-[2fr_1fr]">
          <div>
            <span
              class="rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em]"
            >
              Order Details
            </span>

            <h1 class="mt-5 text-3xl font-bold md:text-4xl">#{{ order.id }}</h1>

            <p class="mt-4 text-slate-200">
              Ordered on
              {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <div class="rounded-3xl bg-white/10 p-6 backdrop-blur">
            <div class="flex items-center justify-between">
              <span class="text-sm uppercase tracking-widest text-slate-300">
                Status
              </span>

              <span
                class="rounded-full px-4 py-2 text-sm font-semibold capitalize"
                :class="badgeClass(order.status)"
              >
                {{ order.status }}
              </span>
            </div>

            <div class="mt-6">
              <p class="text-sm text-slate-300">Order Total</p>

              <h2 class="mt-2 text-4xl font-bold">
                ₹{{ Number(order.total ?? 0).toFixed(2) }}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================== -->
      <!-- DELIVERY TRACKER -->
      <!-- ====================================== -->

      <section class="rounded-3xl bg-white p-8 shadow-card">
        <div class="mb-8 flex items-center justify-between">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Delivery Progress</h2>

            <p class="mt-2 text-slate-500">
              Track your order from confirmation to delivery.
            </p>
          </div>

          <span
            class="rounded-full px-5 py-2 text-sm font-semibold capitalize"
            :class="badgeClass(order.status)"
          >
            {{ order.status }}
          </span>
        </div>

        <div class="relative">
          <!-- Progress Line -->

          <div
            class="absolute left-0 right-0 top-5 h-1 rounded bg-slate-200"
          ></div>

          <div
            class="absolute left-0 top-5 h-1 rounded bg-primary-600 transition-all duration-500"
            :style="{ width: completedWidth }"
          ></div>

          <!-- Steps -->

          <div class="relative grid grid-cols-4">
            <div
              v-for="(step, index) in statusSteps"
              :key="step.key"
              class="flex flex-col items-center"
            >
              <div
                class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold transition-all"
                :class="
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-slate-200 text-slate-500'
                "
              >
                <span v-if="index < currentStepIndex"> ✓ </span>

                <span v-else>
                  {{ step.icon }}
                </span>
              </div>

              <span
                class="mt-4 text-sm font-medium"
                :class="
                  index <= currentStepIndex
                    ? 'text-slate-900'
                    : 'text-slate-400'
                "
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================== -->
      <!-- TRACKING -->
      <!-- ====================================== -->

      <section
        v-if="order.trackingNumber"
        class="rounded-3xl border border-green-200 bg-green-50 p-6"
      >
        <div
          class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-xl font-bold text-green-800">
              📦 Shipment Tracking
            </h3>

            <p class="mt-2 text-green-700">
              Your parcel is currently on the way.
            </p>
          </div>

          <div class="rounded-xl bg-white px-5 py-4 shadow">
            <p class="text-xs uppercase tracking-widest text-slate-500">
              Tracking Number
            </p>

            <h4 class="mt-2 text-lg font-bold text-slate-900">
              {{ order.trackingNumber }}
            </h4>
          </div>
        </div>
      </section>

      <!-- ====================================== -->
      <!-- CONTENT -->
      <!-- ====================================== -->

      <section class="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <!-- ====================================== -->
        <!-- PRODUCTS -->
        <!-- ====================================== -->

        <div class="rounded-3xl bg-white p-8 shadow-card">
          <h2 class="mb-8 text-2xl font-bold text-slate-900">Ordered Items</h2>

          <div class="space-y-5">
            <article
              v-for="item in order.items"
              :key="item.product.id"
              class="flex flex-col gap-5 rounded-2xl border border-slate-200 p-5 transition hover:border-primary-400 hover:bg-slate-50 sm:flex-row"
            >
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="h-28 w-28 rounded-xl bg-slate-100 object-contain p-4"
              />

              <div class="flex-1">
                <h3 class="text-xl font-semibold text-slate-900">
                  {{ item.product.name }}
                </h3>

                <p class="mt-3 text-slate-500">
                  Quantity :
                  <strong>
                    {{ item.quantity }}
                  </strong>
                </p>

                <p class="mt-2 text-slate-500">
                  Unit Price :
                  <strong> ₹{{ item.product.price.toFixed(2) }} </strong>
                </p>
              </div>

              <div class="text-left sm:text-right">
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Total
                </p>

                <h3 class="mt-2 text-2xl font-bold text-primary-700">
                  ₹{{ (item.product.price * item.quantity).toFixed(2) }}
                </h3>
              </div>
            </article>
          </div>
        </div>

        <!-- ====================================== -->
        <!-- RIGHT SIDEBAR -->
        <!-- ====================================== -->

        <aside class="space-y-6">
          <!-- Shipping Address -->

          <div class="rounded-3xl bg-white p-6 shadow-card">
            <h3 class="mb-5 text-xl font-bold text-slate-900">
              📍 Shipping Address
            </h3>

            <div class="space-y-3">
              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Recipient
                </p>
                <p class="mt-1 font-semibold text-slate-900">
                  {{ order.shippingAddress.fullName }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Address
                </p>

                <p class="mt-1 text-slate-700">
                  {{ order.shippingAddress.street }}
                </p>

                <p class="text-slate-700">
                  {{ order.shippingAddress.city }},
                  {{ order.shippingAddress.state }}
                </p>

                <p class="text-slate-700">
                  {{ order.shippingAddress.zipCode }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                <p class="mt-1 text-slate-900">
                  {{ order.shippingAddress.phone }}
                </p>
              </div>
            </div>
          </div>

          <!-- Payment -->

          <div class="rounded-3xl bg-white p-6 shadow-card">
            <h3 class="mb-5 text-xl font-bold text-slate-900">💳 Payment</h3>

            <div class="rounded-2xl bg-slate-50 p-5">
              <p class="text-xs uppercase tracking-wider text-slate-400">
                Method
              </p>

              <h4 class="mt-2 text-lg font-semibold text-slate-900 capitalize">
                {{ order.paymentMethod }}
              </h4>
            </div>
          </div>

          <!-- Order Summary -->

          <div class="rounded-3xl bg-white p-6 shadow-card">
            <h3 class="mb-5 text-xl font-bold text-slate-900">
              💰 Order Summary
            </h3>

            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-slate-500"> Subtotal </span>

                <span class="font-medium">
                  ₹{{ Number(order.total).toFixed(2) }}
                </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500"> Shipping </span>

                <span class="font-medium text-green-600"> FREE </span>
              </div>

              <div class="flex justify-between">
                <span class="text-slate-500"> Tax </span>

                <span class="font-medium"> Included </span>
              </div>

              <div class="border-t pt-4 flex justify-between">
                <span class="text-lg font-bold text-slate-900"> Total </span>

                <span class="text-2xl font-bold text-primary-700">
                  ₹{{ Number(order.total).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->

          <div
            class="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white shadow-card"
          >
            <h3 class="text-xl font-bold">Need Help?</h3>

            <p class="mt-2 text-primary-100">
              Download your invoice or continue shopping.
            </p>

            <div class="mt-6 space-y-3">
              <button
                class="w-full rounded-xl bg-white py-3 font-semibold text-primary-700 transition hover:scale-[1.02]"
              >
                📄 Download Invoice
              </button>

              <RouterLink
                to="/products"
                class="block w-full rounded-xl border border-white/30 py-3 text-center font-semibold text-white transition hover:bg-white/10"
              >
                🛍 Continue Shopping
              </RouterLink>
            </div>
          </div>
        </aside>
      </section>
    </template>

    <!-- ====================================== -->
    <!-- NOT FOUND -->
    <!-- ====================================== -->

    <div v-else class="rounded-3xl bg-white py-24 text-center shadow-card">
      <div class="text-7xl">📦</div>

      <h2 class="mt-6 text-3xl font-bold text-slate-900">Order Not Found</h2>

      <p class="mt-3 text-slate-500">
        We couldn't find the order you're looking for.
      </p>

      <RouterLink
        to="/orders"
        class="mt-8 inline-flex rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition hover:bg-primary-700"
      >
        View All Orders
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 12px rgba(15, 23, 42, 0.04);
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section,
aside,
.shadow-card {
  animation: fadeUp 0.45s ease;
}

img {
  transition: transform 0.3s ease;
}

img:hover {
  transform: scale(1.05);
}

button,
a {
  transition: all 0.25s ease;
}

@media (max-width: 768px) {
  .grid-cols-4 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 2rem;
  }
}
</style>
