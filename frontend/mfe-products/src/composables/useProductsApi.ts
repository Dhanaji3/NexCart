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

// Simple in-memory caches shared across callers
const queryCache = new Map<string, ProductsResponse>();
const productCache = new Map<number, Product>();

export function useProductsApi() {
  const products = ref<Product[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const totalPages = ref(1);

  // getAll supports caching by JSON-serialized params; pass { force: true } to bypass cache
  async function getAll(params?: ProductsQuery, options?: { force?: boolean }) {
    loading.value = true;
    error.value = null;
    try {
      const requestParams = { ...(params || {}), limit: params?.limit ?? 50 };
      const key = JSON.stringify(requestParams || {});

      if (!options?.force && queryCache.has(key)) {
        const data = queryCache.get(key)!;
        products.value = data.products;
        total.value = data.total;
        totalPages.value = data.totalPages;
        return data;
      }

      const { data } = await http.get<ProductsResponse>("/api/products", {
        params: requestParams,
      });

      products.value = data.products;
      total.value = data.total;
      totalPages.value = data.totalPages;
      queryCache.set(key, data);
      // also populate per-id cache
      for (const p of data.products) productCache.set(p.id, p);
      return data;
    } catch (err: any) {
      error.value = err.message || "Failed to load products";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getById(
    id: number,
    options?: { force?: boolean },
  ): Promise<Product | null> {
    loading.value = true;
    error.value = null;
    try {
      if (!options?.force && productCache.has(id)) {
        return productCache.get(id)!;
      }

      const { data } = await http.get<Product>(`/api/products/${id}`);
      productCache.set(id, data);
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
