import { ref } from "vue";
import { http } from "./http";
import type { Product, Category } from "shared";

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Module-level cache so multiple components/useHomeApi callers share data
const featuredProducts = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
let fetched = false;

export function useHomeApi() {
  // fetchHome: load once unless `force` is true
  async function fetchHome(force = false) {
    if (fetched && !force) return;

    loading.value = true;
    error.value = null;
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        http.get<ProductsResponse>("/api/products", { params: { limit: 8 } }),
        http.get<Category[]>("/api/categories"),
      ]);
      featuredProducts.value = productsRes.data.products;
      categories.value = categoriesRes.data;
      fetched = true;
    } catch (err: any) {
      error.value = err.message || "Failed to load home data";
      fetched = false;
    } finally {
      loading.value = false;
    }
  }

  return { featuredProducts, categories, loading, error, fetchHome };
}
