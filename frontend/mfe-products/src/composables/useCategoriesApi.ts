import { ref } from "vue";
import { http } from "./http";
import type { Category } from "shared";

// Module-level cache for categories
const cachedCategories: Category[] = [];
let categoriesFetched = false;

export function useCategoriesApi() {
  const categories = ref<Category[]>(cachedCategories);
  const loading = ref(false);

  async function getAll(force = false) {
    if (categoriesFetched && !force) return categories.value;

    loading.value = true;
    try {
      const { data } = await http.get<Category[]>("/api/categories");
      categories.value = data;
      // update module cache
      cachedCategories.length = 0;
      cachedCategories.push(...data);
      categoriesFetched = true;
      return data;
    } catch {
      // Categories are non-critical
      return [];
    } finally {
      loading.value = false;
    }
  }

  return { categories, loading, getAll };
}
