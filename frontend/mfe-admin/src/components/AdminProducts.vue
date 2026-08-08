<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import type { Product } from "shared";
import { formatCurrency } from "shared";
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
const search = ref("");

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

const filteredProducts = computed(() => {
  if (!search.value) return productList.value;

  const keyword = search.value.toLowerCase();

  return productList.value.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword) ||
      product.category.toLowerCase().includes(keyword) ||
      product.sku.toLowerCase().includes(keyword),
  );
});

const totalProducts = computed(() => productList.value.length);

const inStockProducts = computed(
  () => productList.value.filter((p) => p.inStock).length,
);

const outOfStockProducts = computed(
  () => productList.value.filter((p) => !p.inStock).length,
);

function editProduct(product: Product) {
  editingProduct.value = { ...product };

  Object.assign(formData, {
    ...product,
    stock: product.stock ?? 0,
  });

  showAddModal.value = true;
}

function openAddModal() {
  editingProduct.value = null;

  Object.assign(formData, {
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

  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingProduct.value = null;
}

async function deleteProduct(id: number) {
  if (!confirm("Delete this product?")) return;

  try {
    await remove(id);
  } catch (err: any) {
    alert(err.message);
  }
}

async function saveProduct() {
  saving.value = true;

  try {
    const payload = {
      ...formData,
      stock: Number(formData.stock),
      inStock: Number(formData.stock) > 0,
    };

    if (editingProduct.value) {
      await update(editingProduct.value.id, payload);
    } else {
      await create(payload as Omit<Product, "id">);
    }

    closeModal();
    fetchProducts();
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="space-y-5">
    <section
      class="overflow-hidden rounded-2xl bg-linear-to-r from-slate-900 via-indigo-900 to-violet-900 text-white shadow-xl"
    >
      <div
        class="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]"
          >
            Admin Dashboard
          </span>

          <h1 class="mt-4 text-3xl font-bold">Product Management</h1>

          <p class="mt-2 max-w-xl text-sm text-slate-300">
            Manage your inventory, create new products, update stock and monitor
            your catalogue.
          </p>
        </div>

        <button
          @click="openAddModal"
          class="rounded-2xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-slate-100"
        >
          + Add Product
        </button>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-3">
      <div class="card !p-4 text-center">
        <p class="text-xs uppercase tracking-wide text-slate-400">
          Total Products
        </p>
        <h2 class="mt-2 text-3xl font-bold text-slate-900">
          {{ totalProducts }}
        </h2>
      </div>

      <div class="card !p-4 text-center">
        <p class="text-xs uppercase tracking-wide text-slate-400">In Stock</p>
        <h2 class="mt-2 text-3xl font-bold text-green-600">
          {{ inStockProducts }}
        </h2>
      </div>

      <div class="card !p-4 text-center">
        <p class="text-xs uppercase tracking-wide text-slate-400">
          Out Of Stock
        </p>
        <h2 class="mt-2 text-3xl font-bold text-red-500">
          {{ outOfStockProducts }}
        </h2>
      </div>
    </section>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <div
        class="inline-flex rounded-xl border border-slate-700 bg-slate-900/70 p-1"
      >
        <RouterLink
          to="/admin"
          class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:text-white"
          active-class="bg-emerald-500 text-white shadow"
          exact-active-class="bg-emerald-500 text-white shadow"
        >
          📊 Overview
        </RouterLink>

        <RouterLink
          to="/admin/products"
          class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:text-white"
          active-class="bg-emerald-500 text-white shadow"
        >
          📦 Products
        </RouterLink>

        <RouterLink
          to="/admin/orders"
          class="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-all hover:text-white"
          active-class="bg-emerald-500 text-white shadow"
        >
          🛒 Orders
        </RouterLink>
      </div>

      <input
        v-model="search"
        placeholder="Search products..."
        class="input lg:w-80"
      />
    </div>

    <div v-if="loading" class="card text-center py-10">
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      ></div>

      <p class="mt-5 text-slate-500">Loading products...</p>
    </div>

    <div v-else-if="error" class="card text-center py-10">
      <h2 class="text-xl font-bold text-red-600">
        {{ error }}
      </h2>

      <button @click="fetchProducts" class="btn-primary">Retry</button>
    </div>

    <template v-else>
      <div
        class="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70"
      >
        <div
          class="flex items-center justify-between border-b border-slate-700 px-4 py-3"
        >
          <div>
            <h2 class="text-xl font-bold text-slate-100">Products</h2>
            <p class="mt-1 text-sm text-slate-400">
              {{ filteredProducts.length }} products found
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead
              class="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300"
            >
              <tr>
                <th class="px-4 py-3 font-medium">Product</th>
                <th class="px-4 py-3 font-medium">Category</th>
                <th class="px-4 py-3 font-medium">Price</th>
                <th class="px-4 py-3 font-medium">Rating</th>
                <th class="px-4 py-3 font-medium">Stock</th>
                <th class="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="border-t border-slate-700/80 text-slate-200 transition hover:bg-slate-800/60"
              >
                <td class="px-4 py-4">
                  <div class="flex items-center gap-4">
                    <img
                      :src="product.image"
                      :alt="product.name"
                      class="h-16 w-16 rounded-2xl border border-slate-600 bg-slate-800 object-contain p-2"
                    />

                    <div>
                      <h3 class="font-semibold text-slate-100">
                        {{ product.name }}
                      </h3>

                      <p class="mt-1 text-sm text-slate-400">
                        SKU : {{ product.sku }}
                      </p>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <span
                    class="rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium capitalize text-indigo-300"
                  >
                    {{ product.category }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <span class="text-lg font-bold text-emerald-300">
                    {{ formatCurrency(product.price) }}
                  </span>
                </td>

                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-400">⭐</span>
                    <span class="font-semibold text-slate-100">
                      {{ product.rating }}
                    </span>
                    <span class="text-sm text-slate-400">
                      ({{ product.reviews }})
                    </span>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <div class="space-y-2">
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
                      :class="
                        product.inStock
                          ? 'bg-green-500/15 text-green-300'
                          : 'bg-red-500/15 text-red-300'
                      "
                    >
                      {{ product.inStock ? "In Stock" : "Out of Stock" }}
                    </span>

                    <div class="text-sm text-slate-400">
                      Qty :
                      <strong class="text-slate-200">
                        {{ product.stock ?? 0 }}
                      </strong>
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <div class="flex justify-end gap-3">
                    <button
                      @click="editProduct(product)"
                      class="rounded-xl border border-slate-600 bg-slate-700/80 px-4 py-2 font-semibold text-slate-100 transition hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-100"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      @click="deleteProduct(product.id)"
                      class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 font-semibold text-red-300 transition hover:border-red-300 hover:bg-red-500/25 hover:text-red-100"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid gap-4 lg:hidden">
        <article
          v-for="product in filteredProducts"
          :key="'mobile-' + product.id"
          class="card p-4"
        >
          <div class="flex gap-4">
            <img
              :src="product.image"
              :alt="product.name"
              class="h-24 w-24 rounded-2xl border bg-slate-50 object-contain p-2"
            />

            <div class="flex-1">
              <h3 class="font-bold text-slate-900">
                {{ product.name }}
              </h3>

              <p class="mt-1 text-sm text-slate-500">
                {{ product.category }}
              </p>

              <div class="mt-3 flex items-center justify-between">
                <span class="text-2xl font-bold text-primary-700">
                  {{ formatCurrency(product.price) }}
                </span>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="
                    product.inStock
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  "
                >
                  {{ product.inStock ? "In Stock" : "Out" }}
                </span>
              </div>

              <div class="mt-5 flex gap-3">
                <button
                  @click="editProduct(product)"
                  class="flex-1 rounded-xl bg-primary-600 py-2 text-white"
                >
                  Edit
                </button>

                <button
                  @click="deleteProduct(product.id)"
                  class="flex-1 rounded-xl bg-red-500 py-2 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </template>

    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="showAddModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <form
          @submit.prevent="saveProduct"
          class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        >
          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4"
          >
            <div>
              <h2 class="text-2xl font-bold text-slate-900">
                {{ editingProduct ? "Edit Product" : "Add New Product" }}
              </h2>

              <p class="mt-1 text-slate-500">
                {{
                  editingProduct
                    ? "Update your existing product."
                    : "Create a brand new product."
                }}
              </p>
            </div>

            <button
              type="button"
              @click="closeModal"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl transition hover:bg-red-100 hover:text-red-600"
            >
              ✕
            </button>
          </div>

          <!-- Body -->

          <div class="grid gap-4 p-4 lg:grid-cols-[2fr_1fr]">
            <!-- LEFT -->

            <div class="space-y-6">
              <!-- Product Name -->

              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">
                  Product Name
                </label>

                <input
                  v-model="formData.name"
                  required
                  class="input"
                  placeholder="Apple iPhone 16 Pro"
                />
              </div>

              <!-- Description -->

              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  v-model="formData.description"
                  rows="5"
                  class="input resize-none"
                  placeholder="Enter product description..."
                ></textarea>
              </div>

              <!-- Price + Category -->

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Price
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    v-model.number="formData.price"
                    class="input"
                  />
                </div>

                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category
                  </label>

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

              <!-- SKU + Stock -->

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    SKU
                  </label>

                  <input
                    v-model="formData.sku"
                    class="input"
                    placeholder="ELEC-001"
                  />
                </div>

                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Stock
                  </label>

                  <input
                    type="number"
                    min="0"
                    v-model.number="formData.stock"
                    class="input"
                  />
                </div>
              </div>

              <!-- Rating + Reviews -->

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Rating
                  </label>

                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    v-model.number="formData.rating"
                    class="input"
                  />
                </div>

                <div>
                  <label
                    class="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Reviews
                  </label>

                  <input
                    type="number"
                    min="0"
                    v-model.number="formData.reviews"
                    class="input"
                  />
                </div>
              </div>
            </div>

            <!-- RIGHT -->

            <aside class="space-y-6">
              <div>
                <label class="mb-2 block text-sm font-semibold text-slate-700">
                  Image URL
                </label>

                <input
                  v-model="formData.image"
                  class="input"
                  placeholder="https://..."
                />
              </div>

              <!-- Preview -->

              <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 class="mb-5 text-center font-semibold text-slate-700">
                  Image Preview
                </h3>

                <img
                  v-if="formData.image"
                  :src="formData.image"
                  class="mx-auto h-60 object-contain"
                />

                <div
                  v-else
                  class="flex h-60 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-400"
                >
                  No Image
                </div>
              </div>

              <!-- Stock Status -->

              <div class="rounded-2xl bg-slate-50 p-5">
                <label class="flex items-center justify-between">
                  <span class="font-medium text-slate-700"> In Stock </span>

                  <input
                    type="checkbox"
                    v-model="formData.inStock"
                    class="h-5 w-5 accent-primary-600"
                  />
                </label>
              </div>
            </aside>
          </div>

          <!-- Footer -->

          <div
            class="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-5 py-4"
          >
            <button
              type="button"
              @click="closeModal"
              class="rounded-xl border border-slate-300 px-6 py-3 font-semibold transition hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="saving"
              class="rounded-xl bg-primary-600 px-8 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{
                saving
                  ? "Saving..."
                  : editingProduct
                    ? "Update Product"
                    : "Create Product"
              }}
            </button>
          </div>
        </form>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* ==========================================
   Card
========================================== */

.shadow-card {
  box-shadow:
    0 10px 30px rgba(15, 23, 42, 0.06),
    0 4px 12px rgba(15, 23, 42, 0.04);
}

/* ==========================================
   Inputs
========================================== */

.input {
  width: 100%;
  border: 1px solid rgb(226 232 240);
  border-radius: 14px;
  padding: 0.85rem 1rem;
  background: #fff;
  transition: all 0.25s ease;
  outline: none;
}

.input:focus {
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

/* ==========================================
   Table
========================================== */

table {
  border-collapse: collapse;
}

tbody tr {
  transition: 0.25s;
}

tbody tr:hover {
  background: #f8fafc;
}

/* ==========================================
   Image
========================================== */

img {
  transition: 0.35s;
}

img:hover {
  transform: scale(1.05);
}

/* ==========================================
   Buttons
========================================== */

button,
a {
  transition: all 0.25s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
}

button:disabled {
  cursor: not-allowed;
}

/* ==========================================
   Animation
========================================== */

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

section,
.shadow-card,
table,
article {
  animation: fadeUp 0.45s ease;
}

/* ==========================================
   Scrollbar
========================================== */

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

/* ==========================================
   Responsive
========================================== */

@media (max-width: 1024px) {
  table {
    display: none;
  }
}

@media (min-width: 1025px) {
  .lg\:hidden {
    display: none;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 2rem;
  }

  .grid {
    gap: 1rem;
  }

  .rounded-3xl {
    border-radius: 1.25rem;
  }
}
</style>
