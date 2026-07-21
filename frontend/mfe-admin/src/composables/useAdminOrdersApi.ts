import { ref } from "vue";
import { http } from "./http";
import type { Order } from "shared";

export function useAdminOrdersApi() {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getAll(status?: string) {
    loading.value = true;
    error.value = null;
    try {
      const params = status ? { status } : undefined;
      const { data } = await http.get<Order[]>("/api/admin/orders", { params });
      orders.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to load orders";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateStatus(
    id: string,
    status: string,
    trackingNumber?: string,
  ): Promise<Order | null> {
    loading.value = true;
    error.value = null;
    try {
      const params: Record<string, string> = { status };
      if (trackingNumber) params.trackingNumber = trackingNumber;
      const { data } = await http.put<Order>(
        `/api/admin/orders/${id}/status`,
        null,
        { params },
      );
      const idx = orders.value.findIndex((o) => o.id === id);
      if (idx !== -1) orders.value[idx] = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to update order status";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { orders, loading, error, getAll, updateStatus };
}
