import { ref } from "vue";
import { http } from "./http";
import type { Product, ProductSortOption } from "shared";

export interface ProductsQuery {
  search?: string;
  category?: string;
  sort?: ProductSortOption;
  page?: number;
  limit?: number;
  inStock?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

export function useProductsApi() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const totalPages = ref(1);

  async function getAll(params?: ProductsQuery) {
    loading.value = true;
    error.value = null;
    try {
      // Ensure a sensible default limit so more products are returned by default
      const requestParams = { ...(params || {}), limit: params?.limit ?? 50 };
      const { data } = await http.get<ProductsResponse>("/api/products", {
        params: requestParams,
      });
      products.value = data.products;
      total.value = data.total;
      totalPages.value = data.totalPages;
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to load products";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getById(id: number): Promise<Product | null> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await http.get<Product>(`/api/products/${id}`);
      return data;
    } catch (err: any) {
      error.value = err.message || "Product not found";
      return null;
    } finally {
      loading.value = false;
    }
  }

  return { products, loading, error, total, totalPages, getAll, getById };
}
