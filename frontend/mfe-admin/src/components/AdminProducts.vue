<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import type { Product } from "shared";
import { useAdminProductsApi } from "../composables";

const {
  products: productList,
  loading,
  error,
  getAll,
  create,
  update,
  remove,
} = useAdminProductsApi();
const showAddModal = ref(false);
const editingProduct = ref<Product | null>(null);
const saving = ref(false);

const formData = reactive({
  name: "",
  description: "",
  price: 0,
  category: "electronics",
  image: "",
  sku: "",
  rating: 0,
  reviews: 0,
  inStock: true,
  stock: 0,
});

async function fetchProducts() {
  await getAll({ limit: 100 });
}

onMounted(fetchProducts);

async function deleteProduct(id: number) {
  if (!confirm("Are you sure you want to delete this product?")) return;
  try {
    await remove(id);
  } catch (err: any) {
    alert("Failed to delete: " + (err.message || "Unknown error"));
  }
}

function editProduct(product: Product) {
  editingProduct.value = { ...product };
  formData.name = product.name;
  formData.description = product.description;
  formData.price = product.price;
  formData.category = product.category;
  formData.image = product.image;
  formData.sku = product.sku;
  formData.rating = product.rating;
  formData.reviews = product.reviews;
  formData.inStock = product.inStock;
  formData.stock = product.stock ?? 0;
  showAddModal.value = true;
}

function openAddModal() {
  editingProduct.value = null;
  formData.name = "";
  formData.description = "";
  formData.price = 0;
  formData.category = "electronics";
  formData.image = "";
  formData.sku = "";
  formData.rating = 0;
  formData.reviews = 0;
  formData.inStock = true;
  formData.stock = 0;
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingProduct.value = null;
}

async function saveProduct() {
  saving.value = true;
  try {
    const stock = Number(formData.stock) || 0;
    const payload = {
      ...formData,
      stock,
      inStock: stock > 0,
    };

    if (editingProduct.value) {
      const updated = await update(editingProduct.value.id, payload);
      if (updated) {
        const index = productList.value.findIndex((p) => p.id === updated.id);
        if (index !== -1) productList.value[index] = updated;
        closeModal();
      }
    } else {
      const created = await create(payload as Omit<Product, "id">);
      if (created) {
        closeModal();
      }
    }
  } catch (err: any) {
    alert("Failed to save: " + (err?.message || "Unknown error"));
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="py-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h2 class="text-2xl font-bold text-slate-900">Manage Products</h2>
      <button @click="openAddModal" class="btn-primary">+ Add Product</button>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center py-12 text-slate-500"
    >
      <div
        class="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3"
      ></div>
      <p>Loading products...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card p-6 text-center">
      <p class="text-rose-600 mb-3">{{ error }}</p>
      <button @click="fetchProducts()" class="btn-primary">Retry</button>
    </div>

    <template v-else>
      <!-- Search/filter bar -->
      <div class="flex gap-3 mb-6">
        <span class="text-sm text-slate-500 self-center"
          >{{ productList.length }} products</span
        >
      </div>

      <!-- Products table -->
      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Product
              </th>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Category
              </th>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Price
              </th>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Rating
              </th>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Stock
              </th>
              <th
                class="text-left text-xs font-medium text-slate-500 uppercase px-4 py-3"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in productList"
              :key="product.id"
              class="border-b border-slate-100"
            >
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img
                    :src="product.image"
                    :alt="product.name"
                    class="w-10 h-10 object-cover rounded"
                  />
                  <div>
                    <span class="block font-medium text-slate-900">{{
                      product.name
                    }}</span>
                    <span class="block text-xs text-slate-400">{{
                      product.sku
                    }}</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3">
                <span class="badge bg-slate-100 text-slate-700">{{
                  product.category
                }}</span>
              </td>
              <td class="px-4 py-3 font-semibold text-emerald-600">
                ${{ product.price.toFixed(2) }}
              </td>
              <td class="px-4 py-3 text-sm text-slate-600">
                ⭐ {{ product.rating }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="badge"
                  :class="
                    product.inStock
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  "
                >
                  {{ product.inStock ? "In Stock" : "Out" }}
                </span>
              </td>
              <td class="px-4 py-3">
                <div class="flex gap-2">
                  <button @click="editProduct(product)" class="btn-ghost">
                    Edit
                  </button>
                  <button
                    @click="deleteProduct(product.id)"
                    class="btn-ghost text-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Add/Edit Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <form
        @submit.prevent="saveProduct"
        class="card max-w-lg w-full p-6 space-y-4"
      >
        <h3 class="text-lg font-semibold text-slate-900">
          {{ editingProduct ? "Edit Product" : "Add New Product" }}
        </h3>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5"
            >Product Name</label
          >
          <input
            type="text"
            v-model="formData.name"
            placeholder="Product name"
            required
            class="input"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Price</label
            >
            <input
              type="number"
              v-model.number="formData.price"
              placeholder="0.00"
              step="0.01"
              required
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Category</label
            >
            <select v-model="formData.category" class="input">
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home-garden">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
              <option value="beauty">Beauty</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >SKU</label
            >
            <input
              type="text"
              v-model="formData.sku"
              placeholder="ELEC-001"
              class="input"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Image URL</label
            >
            <input
              type="text"
              v-model="formData.image"
              placeholder="https://..."
              class="input"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1.5"
            >Description</label
          >
          <textarea
            v-model="formData.description"
            placeholder="Product description"
            rows="3"
            class="input"
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5"
              >Stock Quantity</label
            >
            <input
              type="number"
              v-model.number="formData.stock"
              min="0"
              step="1"
              class="input"
            />
          </div>
          <div class="flex items-end">
            <label
              class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer"
            >
              <input
                type="checkbox"
                v-model="formData.inStock"
                class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              In Stock
            </label>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" @click="closeModal" class="btn-outline">
            Cancel
          </button>
          <button type="submit" class="btn-accent" :disabled="saving">
            {{
              saving
                ? "Saving..."
                : (editingProduct ? "Update" : "Add") + " Product"
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
