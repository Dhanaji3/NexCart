import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Order, OrderCreateInput, OrderStatus } from "../types";
import { ordersApi } from "../api";

export const useOrdersStore = defineStore("orders", () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const statusFilter = ref<OrderStatus | "">("");
  const loading = ref(false);
  const error = ref<string | null>(null);

  const orderCount = computed(() => orders.value.length);
  const filteredOrders = computed(() =>
    statusFilter.value
      ? orders.value.filter((order) => order.status === statusFilter.value)
      : orders.value,
  );
  const pendingOrders = computed(
    () => orders.value.filter((order) => order.status === "pending").length,
  );

  async function fetchOrders(status?: OrderStatus) {
    loading.value = true;
    error.value = null;

    try {
      const result = await ordersApi.getAll(status);
      orders.value = result;
      return orders.value;
    } catch (err: any) {
      error.value = err.message || "Failed to load orders";
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderById(orderId: string) {
    loading.value = true;
    error.value = null;

    try {
      const order = await ordersApi.getById(orderId);
      currentOrder.value = order;
      return order;
    } catch (err: any) {
      error.value = err.message || "Failed to load order";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createOrder(input: OrderCreateInput) {
    loading.value = true;
    error.value = null;

    try {
      const order = await ordersApi.create(input);
      orders.value.unshift(order);
      currentOrder.value = order;
      return order;
    } catch (err: any) {
      error.value = err.message || "Failed to create order";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
  ) {
    loading.value = true;
    error.value = null;

    try {
      const updated = await ordersApi.updateStatus(
        orderId,
        status,
        trackingNumber,
      );
      const index = orders.value.findIndex((order) => order.id === orderId);
      if (index !== -1) {
        orders.value[index] = updated;
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = updated;
      }
      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to update order status";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    orders,
    currentOrder,
    statusFilter,
    loading,
    error,
    orderCount,
    filteredOrders,
    pendingOrders,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateStatus,
  };
});
