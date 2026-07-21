import { ref } from "vue";
import { http } from "./http";
import type { Product } from "shared";

export function useAdminProductsApi() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getAll(params?: { limit?: number }) {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.get<Product[]>("/api/admin/products", {
        params,
      });
      products.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to load products";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function create(product: Omit<Product, "id">): Promise<Product> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.post<Product>("/api/admin/products", product);
      products.value.unshift(data);
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to create product";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function update(
    id: number,
    product: Partial<Product>,
  ): Promise<Product> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.put<Product>(
        `/api/admin/products/${id}`,
        product,
      );
      const idx = products.value.findIndex((p) => p.id === id);
      if (idx !== -1) products.value[idx] = data;
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to update product";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function remove(id: number): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      await http.delete(`/api/admin/products/${id}`);
      products.value = products.value.filter((p) => p.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to delete product";
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, getAll, create, update, remove };
}
