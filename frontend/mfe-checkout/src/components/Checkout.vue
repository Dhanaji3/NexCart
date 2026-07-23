<script setup lang="ts">
import { ref, reactive } from "vue";
import { useCartStore } from "shared";
import { useRouter } from "vue-router";
import type { Address } from "shared";
import { useCheckoutApi } from "../composables";

const cart = useCartStore();
const router = useRouter();
const { createOrder } = useCheckoutApi();

const currentStep = ref(1);
const isProcessing = ref(false);
const orderPlaced = ref(false);
const orderError = ref<string | null>(null);
const placedOrderId = ref<string | null>(null);

const shippingAddress = reactive<Address>({
  fullName: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
  phone: "",
});

const paymentMethod = ref("credit-card");
const cardNumber = ref("");
const cardExpiry = ref("");
const cardCvc = ref("");

function nextStep() {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function placeOrder() {
  isProcessing.value = true;
  orderError.value = null;
  try {
    const paymentLabel =
      paymentMethod.value === "credit-card"
        ? `Card ending ${cardNumber.value.slice(-4)}`
        : paymentMethod.value === "paypal"
          ? "PayPal"
          : "Bank Transfer";

    const order = await createOrder({
      shippingAddress: { ...shippingAddress },
      paymentMethod: paymentLabel,
      items: cart.items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    });
    if (order) {
      placedOrderId.value = order.id;
      orderPlaced.value = true;
      cart.clearCart();
    } else {
      orderError.value = "Failed to place order";
    }
  } catch (err: any) {
    orderError.value = err.message || "Failed to place order";
  } finally {
    isProcessing.value = false;
  }
}

function goToOrders() {
  router.push("/orders");
}
</script>

<template>
  <div class="py-4">
    <h2 class="text-2xl font-bold text-slate-900 mb-6">Checkout</h2>

    <!-- Order Success -->
    <div v-if="orderPlaced" class="card text-center py-12">
      <div
        class="w-16 h-16 bg-accent-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
      >
        ✓
      </div>
      <h3 class="text-xl font-semibold text-slate-900 mb-2">
        Order Placed Successfully!
      </h3>
      <p class="text-slate-500 mb-1">
        Thank you for your purchase. Your order has been confirmed.
      </p>
      <p class="font-semibold text-accent-600 mb-6">
        Order ID: ORD-{{ Date.now().toString().slice(-6) }}
      </p>
      <div class="flex gap-3 justify-center">
        <button @click="goToOrders" class="btn-accent">View Orders</button>
        <RouterLink to="/products" class="btn-outline"
          >Continue Shopping</RouterLink
        >
      </div>
    </div>

    <!-- Checkout Steps -->
    <div v-else-if="cart.items.length > 0">
      <!-- Progress Steps -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold"
            :class="
              currentStep > 1
                ? 'bg-accent-500 text-white'
                : currentStep >= 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
            "
            >1</span
          >
          <span
            class="text-sm font-medium"
            :class="currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'"
            >Shipping</span
          >
        </div>
        <div
          class="h-0.5 w-12"
          :class="currentStep > 1 ? 'bg-primary-600' : 'bg-slate-200'"
        ></div>
        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold"
            :class="
              currentStep > 2
                ? 'bg-accent-500 text-white'
                : currentStep >= 2
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-200 text-slate-500'
            "
            >2</span
          >
          <span
            class="text-sm font-medium"
            :class="currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'"
            >Payment</span
          >
        </div>
        <div
          class="h-0.5 w-12"
          :class="currentStep > 2 ? 'bg-primary-600' : 'bg-slate-200'"
        ></div>
        <div class="flex items-center gap-2">
          <span
            class="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold"
            :class="
              currentStep >= 3
                ? 'bg-primary-600 text-white'
                : 'bg-slate-200 text-slate-500'
            "
            >3</span
          >
          <span
            class="text-sm font-medium"
            :class="currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'"
            >Review</span
          >
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
        <div>
          <!-- Step 1: Shipping -->
          <div v-if="currentStep === 1" class="card space-y-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Shipping Address
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >Full Name</label
                >
                <input
                  v-model="shippingAddress.fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  class="input"
                />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >Street Address</label
                >
                <input
                  v-model="shippingAddress.street"
                  type="text"
                  placeholder="123 Main St"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >City</label
                >
                <input
                  v-model="shippingAddress.city"
                  type="text"
                  placeholder="New York"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >State</label
                >
                <input
                  v-model="shippingAddress.state"
                  type="text"
                  placeholder="NY"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >ZIP Code</label
                >
                <input
                  v-model="shippingAddress.zipCode"
                  type="text"
                  placeholder="10001"
                  required
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >Phone</label
                >
                <input
                  v-model="shippingAddress.phone"
                  type="tel"
                  placeholder="+1-555-0123"
                  required
                  class="input"
                />
              </div>
            </div>
            <div class="flex justify-end mt-6">
              <button @click="nextStep" class="btn-accent">
                Continue to Payment
              </button>
            </div>
          </div>

          <!-- Step 2: Payment -->
          <div v-if="currentStep === 2" class="card space-y-4">
            <h3 class="text-lg font-semibold text-slate-900">Payment Method</h3>
            <div class="flex flex-col gap-3">
              <label
                class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'credit-card'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="credit-card"
                  class="accent-primary-600"
                />
                <span class="text-sm font-medium text-slate-700"
                  >💳 Credit Card</span
                >
              </label>
              <label
                class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'paypal'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="paypal"
                  class="accent-primary-600"
                />
                <span class="text-sm font-medium text-slate-700"
                  >🅿️ PayPal</span
                >
              </label>
              <label
                class="flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors"
                :class="
                  paymentMethod === 'apple-pay'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
              >
                <input
                  type="radio"
                  v-model="paymentMethod"
                  value="apple-pay"
                  class="accent-primary-600"
                />
                <span class="text-sm font-medium text-slate-700"
                  >🍎 Apple Pay</span
                >
              </label>
            </div>

            <div
              v-if="paymentMethod === 'credit-card'"
              class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4"
            >
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >Card Number</label
                >
                <input
                  v-model="cardNumber"
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  maxlength="19"
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >Expiry Date</label
                >
                <input
                  v-model="cardExpiry"
                  type="text"
                  placeholder="MM/YY"
                  maxlength="5"
                  class="input"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5"
                  >CVC</label
                >
                <input
                  v-model="cardCvc"
                  type="text"
                  placeholder="123"
                  maxlength="4"
                  class="input"
                />
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button @click="prevStep" class="btn-outline">← Back</button>
              <button @click="nextStep" class="btn-accent">Review Order</button>
            </div>
          </div>

          <!-- Step 3: Review -->
          <div v-if="currentStep === 3" class="card space-y-4">
            <h3 class="text-lg font-semibold text-slate-900">
              Review Your Order
            </h3>
            <div class="pb-4 border-b border-slate-100">
              <h4 class="text-xs font-medium text-slate-400 uppercase mb-1">
                Shipping To:
              </h4>
              <p class="text-sm text-slate-700">
                {{ shippingAddress.fullName }}
              </p>
              <p class="text-sm text-slate-700">{{ shippingAddress.street }}</p>
              <p class="text-sm text-slate-700">
                {{ shippingAddress.city }}, {{ shippingAddress.state }}
                {{ shippingAddress.zipCode }}
              </p>
            </div>
            <div class="pb-4 border-b border-slate-100">
              <h4 class="text-xs font-medium text-slate-400 uppercase mb-1">
                Payment:
              </h4>
              <p
                v-if="paymentMethod === 'credit-card'"
                class="text-sm text-slate-700"
              >
                💳 Credit Card ending in {{ cardNumber.slice(-4) }}
              </p>
              <p
                v-else-if="paymentMethod === 'paypal'"
                class="text-sm text-slate-700"
              >
                🅿️ PayPal
              </p>
              <p v-else class="text-sm text-slate-700">🍎 Apple Pay</p>
            </div>
            <div class="pb-4 border-b border-slate-100">
              <h4 class="text-xs font-medium text-slate-400 uppercase mb-1">
                Items ({{ cart.totalItems }}):
              </h4>
              <div
                v-for="item in cart.items"
                :key="item.product.id"
                class="flex justify-between py-1 text-sm text-slate-600"
              >
                <span>{{ item.product.name }} × {{ item.quantity }}</span>
                <span
                  >₹{{ (item.product.price * item.quantity).toFixed(2) }}</span
                >
              </div>
            </div>
            <div class="flex justify-between mt-6">
              <button @click="prevStep" class="btn-outline">← Back</button>
              <button
                @click="placeOrder"
                :disabled="isProcessing"
                class="btn-accent"
              >
                {{ isProcessing ? "Processing..." : "Place Order" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="card sticky top-20">
          <h3 class="text-lg font-semibold text-slate-900 mb-4">
            Order Summary
          </h3>
          <div class="space-y-3 pb-4 mb-4 border-b border-slate-100">
            <div
              v-for="item in cart.items"
              :key="item.product.id"
              class="flex items-center gap-3"
            >
              <img
                :src="item.product.image"
                :alt="item.product.name"
                class="w-12 h-12 rounded-md object-cover"
              />
              <div class="flex-1 min-w-0">
                <span class="block text-sm text-slate-700 truncate">{{
                  item.product.name
                }}</span>
                <span class="text-xs text-slate-400"
                  >Qty: {{ item.quantity }}</span
                >
              </div>
              <span class="text-sm font-semibold text-slate-900"
                >₹{{ (item.product.price * item.quantity).toFixed(2) }}</span
              >
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm text-slate-500">
              <span>Subtotal</span>
              <span>₹{{ cart.totalPrice.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-sm text-slate-500">
              <span>Shipping</span>
              <span>{{
                cart.shipping === 0 ? "FREE" : `₹${cart.shipping.toFixed(2)}`
              }}</span>
            </div>
            <div
              class="flex justify-between pt-3 mt-2 border-t-2 border-slate-200 text-lg font-bold text-slate-900"
            >
              <span>Total</span>
              <span>₹{{ cart.grandTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="text-center py-16">
      <p class="text-slate-500 mb-4">
        Your cart is empty. Add some products first!
      </p>
      <RouterLink to="/products" class="btn-accent">Browse Products</RouterLink>
    </div>
  </div>
</template>
