<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { jsPDF } from "jspdf";
import { useOrdersApi } from "../composables";
import { formatCurrency } from "shared";

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

function downloadInvoice() {
  if (!order.value) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 40;
  const width = 515;
  let y = 50;

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 595, 90, "F");
  doc.setFontSize(24);
  doc.setTextColor("#ffffff");
  doc.text("NexCart Invoice", left, 50);
  doc.setFontSize(12);
  doc.setTextColor("#cbd5e1");
  doc.text("Premium Store", left, 70);

  y = 110;
  doc.setDrawColor(220);
  doc.line(left, y, left + width, y);
  y += 20;

  doc.setFontSize(12);
  doc.setTextColor("#102a43");
  doc.text(`Order #${order.value.id}`, left, y);
  doc.text(`Date: ${formatDate(order.value.createdAt)}`, left + 260, y);
  y += 18;
  doc.text(`Status: ${order.value.status}`, left, y);

  y += 28;
  doc.setFontSize(14);
  doc.setTextColor("#102a43");
  doc.text("Items", left, y);
  y += 16;

  doc.setFontSize(11);
  doc.setTextColor("#334155");
  doc.text("Product", left, y);
  doc.text("Qty", left + 260, y);
  doc.text("Unit Price", left + 330, y);
  doc.text("Total", left + 450, y);
  y += 10;
  doc.setLineWidth(0.5);
  doc.line(left, y, left + width, y);
  y += 14;

  order.value.items.forEach((item) => {
    if (y > 740) {
      doc.addPage();
      y = 50;
    }

    doc.text(item.product.name, left, y, { maxWidth: 220 });
    doc.text(String(item.quantity), left + 260, y);
    doc.text(formatCurrency(item.product.price), left + 330, y);
    doc.text(formatCurrency(item.product.price * item.quantity), left + 450, y);
    y += 18;
  });

  y += 16;
  doc.setDrawColor(220);
  doc.line(left, y, left + width, y);
  y += 18;

  doc.setFontSize(12);
  doc.setTextColor("#102a43");
  doc.text("Shipping Address", left, y);
  y += 16;
  doc.setFontSize(11);
  doc.setTextColor("#334155");
  doc.text(order.value.shippingAddress.fullName, left, y);
  y += 14;
  doc.text(order.value.shippingAddress.street, left, y);
  y += 14;
  doc.text(
    `${order.value.shippingAddress.city}, ${order.value.shippingAddress.state} ${order.value.shippingAddress.zipCode}`,
    left,
    y,
    { maxWidth: 260 },
  );
  y += 14;
  doc.text(`Phone: ${order.value.shippingAddress.phone}`, left, y);

  const rightCol = left + 320;
  y = 170;
  doc.setFontSize(12);
  doc.setTextColor("#102a43");
  doc.text("Payment Method", rightCol, y);
  y += 16;
  doc.setFontSize(11);
  doc.setTextColor("#334155");
  doc.text(order.value.paymentMethod, rightCol, y);

  y += 40;
  doc.setDrawColor(220);
  doc.line(rightCol, y, left + width, y);
  y += 18;
  doc.setFontSize(14);
  doc.setTextColor("#102a43");
  doc.text("Order Total", rightCol, y);
  doc.setFontSize(16);
  doc.setTextColor("#0f766e");
  doc.text(
    formatCurrency(Number(order.value.total ?? 0)),
    left + width - 80,
    y,
    {
      align: "right",
    },
  );

  doc.save(`invoice-${order.value.id}.pdf`);
}
</script>

<template>
  <div class="mx-auto max-w-300 px-4 py-6 space-y-6">
    <!-- ====================================== -->
    <!-- LOADING -->
    <!-- ====================================== -->

    <div
      v-if="loading"
      class="rounded-3xl bg-[#0c1427]/95 p-5 shadow-xl shadow-black/20"
    >
      <div class="animate-pulse">
        <div class="mb-5 h-7 w-52 rounded bg-slate-700"></div>

        <div class="mb-3 h-3.5 w-full rounded bg-slate-700"></div>

        <div class="mb-3 h-3.5 w-3/4 rounded bg-slate-700"></div>

        <div class="mt-6 h-52 rounded-2xl bg-slate-700"></div>
      </div>
    </div>

    <!-- ====================================== -->
    <!-- ERROR -->
    <!-- ====================================== -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-[#0c1427]/95 p-6 text-center shadow-xl shadow-black/20"
    >
      <div class="mx-auto max-w-sm">
        <div class="text-4xl">😕</div>

        <h2 class="mt-4 text-lg font-bold text-white">
          Unable to load your order
        </h2>

        <p class="mt-3 text-slate-300 text-sm">
          {{ error }}
        </p>

        <button
          @click="fetchOrder"
          class="mt-4 rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
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
        class="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
      >
        ← Back to Orders
      </button>

      <!-- ====================================== -->
      <!-- HERO -->
      <!-- ====================================== -->

      <section
        class="overflow-hidden rounded-3xl bg-[#0c1427]/95 text-white shadow-xl shadow-black/25"
      >
        <div class="grid items-center gap-4 px-5 py-5 md:grid-cols-[2fr_1fr]">
          <div>
            <span
              class="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-200"
            >
              Order Details
            </span>

            <h1 class="mt-4 text-2xl font-bold md:text-3xl">#{{ order.id }}</h1>

            <p class="mt-3 text-sm text-slate-300">
              Ordered on
              {{ formatDate(order.createdAt) }}
            </p>
          </div>

          <div class="rounded-2xl bg-white/10 p-3 backdrop-blur">
            <div class="flex items-center justify-between gap-3">
              <span class="text-xs uppercase tracking-widest text-slate-300">
                Status
              </span>

              <span
                class="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                :class="badgeClass(order.status)"
              >
                {{ order.status }}
              </span>
            </div>

            <div class="mt-5">
              <p class="text-sm text-slate-300">Order Total</p>

              <h2 class="mt-2 text-3xl font-bold text-white">
                {{ formatCurrency(Number(order.total ?? 0)) }}
              </h2>
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================== -->
      <!-- DELIVERY TRACKER -->
      <!-- ====================================== -->

      <section
        class="rounded-3xl bg-[#0b1220]/95 p-4 shadow-xl shadow-black/20"
      >
        <div
          class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-lg font-bold text-white">Delivery Progress</h2>

            <p class="mt-2 text-slate-400 text-sm">
              Track your order from confirmation to delivery.
            </p>
          </div>

          <span
            class="rounded-full px-3 py-1.5 text-xs font-semibold capitalize text-white"
            :class="badgeClass(order.status)"
          >
            {{ order.status }}
          </span>
        </div>

        <div class="relative">
          <div
            class="absolute left-0 right-0 top-5 h-1 rounded bg-slate-800"
          ></div>

          <div
            class="absolute left-0 top-5 h-1 rounded bg-linear-to-r from-blue-600 to-cyan-500 transition-all duration-500"
            :style="{ width: completedWidth }"
          ></div>

          <div class="relative grid grid-cols-4 gap-3">
            <div
              v-for="(step, index) in statusSteps"
              :key="step.key"
              class="flex flex-col items-center"
            >
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full text-base font-bold transition-all"
                :class="
                  index < currentStepIndex
                    ? 'bg-green-500 text-white'
                    : index === currentStepIndex
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100/20'
                      : 'bg-slate-700 text-slate-300'
                "
              >
                <span v-if="index < currentStepIndex">✓</span>
                <span v-else>{{ step.icon }}</span>
              </div>

              <span
                class="mt-3 text-[11px] font-medium"
                :class="
                  index <= currentStepIndex ? 'text-white' : 'text-slate-400'
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
        class="rounded-3xl bg-[#0b1220]/95 border border-white/10 p-5 shadow-sm shadow-black/20"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h3 class="text-lg font-bold text-white">📦 Shipment Tracking</h3>

            <p class="mt-2 text-slate-400 text-sm">
              Your parcel is currently on the way.
            </p>
          </div>

          <div
            class="rounded-3xl bg-[#111827]/95 p-4 shadow-sm shadow-black/10"
          >
            <p class="text-xs uppercase tracking-widest text-slate-400">
              Method
            </p>

            <h4 class="mt-2 text-lg font-bold text-white">
              {{ order.trackingNumber }}
            </h4>
          </div>
        </div>
      </section>

      <!-- ====================================== -->
      <!-- CONTENT -->
      <!-- ====================================== -->

      <section class="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <!-- ====================================== -->
        <!-- PRODUCTS -->
        <!-- ====================================== -->

        <div class="rounded-3xl bg-[#0b1220]/95 p-4 shadow-xl shadow-black/20">
          <div
            class="flex items-center justify-between gap-3 pb-3 border-b border-white/10"
          >
            <h2 class="text-lg font-bold text-white">Ordered Items</h2>
            <span class="text-sm uppercase tracking-[0.35em] text-slate-400"
              >Total {{ order.items.length }}</span
            >
          </div>

          <div class="space-y-3 pt-3">
            <article
              v-for="item in order.items"
              :key="item.product.id"
              class="flex flex-col gap-3 rounded-3xl border border-slate-800 bg-[#101828]/90 p-3 transition hover:border-cyan-400/40 hover:bg-[#111b2f] sm:flex-row sm:items-center"
            >
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="h-20 w-20 rounded-3xl bg-white/5 object-contain p-2"
              />

              <div class="flex-1">
                <h3 class="text-base font-semibold text-white">
                  {{ item.product.name }}
                </h3>

                <p class="mt-2 text-sm text-slate-400">
                  Quantity:
                  <strong class="text-white">{{ item.quantity }}</strong>
                </p>

                <p class="mt-1 text-sm text-slate-400">
                  Unit Price:
                  <strong class="text-white">{{
                    formatCurrency(item.product.price)
                  }}</strong>
                </p>
              </div>

              <div class="text-left sm:text-right">
                <p
                  class="text-[10px] uppercase tracking-[0.35em] text-slate-500"
                >
                  Item Total
                </p>

                <h3 class="mt-2 text-lg font-bold text-cyan-300">
                  {{ formatCurrency(item.product.price * item.quantity) }}
                </h3>
              </div>
            </article>
          </div>
        </div>

        <!-- ====================================== -->
        <!-- RIGHT SIDEBAR -->
        <!-- ====================================== -->

        <aside class="space-y-4">
          <!-- Shipping Address -->

          <div
            class="rounded-3xl bg-[#0b1220]/95 p-4 shadow-xl shadow-black/20"
          >
            <h3 class="mb-3 text-lg font-bold text-white">
              📍 Shipping Address
            </h3>

            <div class="space-y-3 text-sm text-slate-300">
              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Recipient
                </p>
                <p class="mt-1 font-semibold text-white">
                  {{ order.shippingAddress.fullName }}
                </p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Address
                </p>
                <p class="mt-1">{{ order.shippingAddress.street }}</p>
                <p>
                  {{ order.shippingAddress.city }},
                  {{ order.shippingAddress.state }}
                </p>
                <p>{{ order.shippingAddress.zipCode }}</p>
              </div>

              <div>
                <p class="text-xs uppercase tracking-[0.35em] text-slate-400">
                  Phone
                </p>
                <p class="mt-1 text-white">{{ order.shippingAddress.phone }}</p>
              </div>
            </div>
          </div>

          <!-- Payment -->

          <div
            class="rounded-3xl bg-[#0b1220]/95 p-4 shadow-xl shadow-black/20"
          >
            <h3 class="mb-3 text-lg font-bold text-white">💳 Payment</h3>

            <div class="rounded-3xl bg-slate-950 p-3">
              <p class="text-xs uppercase tracking-[0.35em] text-slate-500">
                Method
              </p>
              <h4 class="mt-2 text-base font-semibold text-white capitalize">
                {{ order.paymentMethod }}
              </h4>
            </div>
          </div>

          <!-- Order Summary -->

          <div
            class="rounded-3xl bg-[#0b1220]/95 p-4 shadow-xl shadow-black/20"
          >
            <h3 class="mb-3 text-lg font-bold text-white">💰 Order Summary</h3>

            <div class="space-y-3 text-sm text-slate-300">
              <div class="flex justify-between">
                <span>Subtotal</span>
                <span class="font-medium text-white">{{
                  formatCurrency(Number(order.total))
                }}</span>
              </div>

              <div class="flex justify-between">
                <span>Shipping</span>
                <span class="font-medium text-emerald-400">FREE</span>
              </div>

              <div class="flex justify-between">
                <span>Tax</span>
                <span class="font-medium text-white">Included</span>
              </div>

              <div class="border-t border-slate-800 pt-3 flex justify-between">
                <span class="text-sm font-bold text-white">Total</span>
                <span class="text-xl font-bold text-cyan-300">{{
                  formatCurrency(Number(order.total))
                }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->

          <div
            class="rounded-3xl bg-linear-to-br from-blue-600 to-cyan-500 p-3 text-white shadow-sm shadow-black/15"
          >
            <h3 class="text-lg font-bold">Need Help?</h3>
            <p class="mt-2 text-sky-100 text-sm">
              Download your invoice or continue shopping.
            </p>

            <div class="mt-5 space-y-3">
              <button
                @click="downloadInvoice"
                class="w-full rounded-3xl bg-white py-3 text-sm font-semibold text-blue-700 transition hover:bg-slate-100"
              >
                📄 Download Invoice
              </button>

              <RouterLink
                to="/products"
                class="block w-full rounded-3xl border border-white/30 py-3 text-center font-semibold text-white transition hover:bg-white/10"
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

    <div
      v-else
      class="rounded-3xl bg-[#0c1427]/95 p-6 text-center shadow-xl shadow-black/20"
    >
      <div class="text-5xl">📦</div>

      <h2 class="mt-4 text-xl font-bold text-white">Order Not Found</h2>

      <p class="mt-3 text-slate-300 text-sm">
        We couldn't find the order you're looking for.
      </p>

      <RouterLink
        to="/orders"
        class="mt-6 inline-flex rounded-2xl bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
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
