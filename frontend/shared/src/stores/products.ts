import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Product,
  Category,
  ProductCreateInput,
  ProductUpdateInput,
} from "../types";
import { productsApi, categoriesApi } from "../api";

export const useProductsStore = defineStore("products", () => {
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const selectedProduct = ref<Product | null>(null);
  const total = ref(0);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const searchQuery = ref("");
  const selectedCategory = ref("");
  const sortBy = ref<"price-asc" | "price-desc" | "rating" | "name" | "newest">(
    "name",
  );
  const page = ref(1);

  const hasProducts = computed(() => products.value.length > 0);

  async function fetchProducts(params?: Record<string, unknown>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await productsApi.getAll(params);
      products.value = response.products;
      total.value = response.total;
      return response;
    } catch (err: any) {
      error.value = err.message || "Failed to load products";
      return { products: [], total: 0, page: 1, totalPages: 0 };
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategories() {
    loading.value = true;
    error.value = null;

    try {
      categories.value = await categoriesApi.getAll();
      return categories.value;
    } catch (err: any) {
      error.value = err.message || "Failed to load categories";
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function fetchProductById(productId: number) {
    loading.value = true;
    error.value = null;

    try {
      const product = await productsApi.getById(productId);
      selectedProduct.value = product;
      return product;
    } catch (err: any) {
      error.value = err.message || "Failed to load product";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createProduct(input: ProductCreateInput) {
    loading.value = true;
    error.value = null;

    try {
      const product = await productsApi.create(input);
      products.value.unshift(product);
      total.value += 1;
      return product;
    } catch (err: any) {
      error.value = err.message || "Failed to create product";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateProduct(productId: number, updates: ProductUpdateInput) {
    loading.value = true;
    error.value = null;

    try {
      const updated = await productsApi.update(productId, updates);
      const index = products.value.findIndex(
        (product) => product.id === productId,
      );
      if (index !== -1) {
        products.value[index] = updated;
      }
      if (selectedProduct.value?.id === productId) {
        selectedProduct.value = updated;
      }
      return updated;
    } catch (err: any) {
      error.value = err.message || "Failed to update product";
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteProduct(productId: number) {
    loading.value = true;
    error.value = null;

    try {
      await productsApi.delete(productId);
      products.value = products.value.filter(
        (product) => product.id !== productId,
      );
      total.value = Math.max(0, total.value - 1);
      return true;
    } catch (err: any) {
      error.value = err.message || "Failed to delete product";
      return false;
    } finally {
      loading.value = false;
    }
  }

  function resetFilters() {
    searchQuery.value = "";
    selectedCategory.value = "";
    sortBy.value = "name";
    page.value = 1;
  }

  return {
    products,
    categories,
    selectedProduct,
    total,
    loading,
    error,
    searchQuery,
    selectedCategory,
    sortBy,
    page,
    hasProducts,
    fetchProducts,
    fetchCategories,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    resetFilters,
  };
});
