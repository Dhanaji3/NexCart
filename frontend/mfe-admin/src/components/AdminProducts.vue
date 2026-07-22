<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
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
  <div class="space-y-8">
    <!-- HERO -->

    <section
      class="overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 text-white shadow-xl"
    >
      <div
        class="flex flex-col gap-8 p-8 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <span
            class="rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em]"
          >
            Admin Dashboard
          </span>

          <h1 class="mt-5 text-4xl font-bold">Product Management</h1>

          <p class="mt-3 max-w-xl text-primary-100">
            Manage your inventory, create new products, update stock and monitor
            your catalogue.
          </p>
        </div>

        <button
          @click="openAddModal"
          class="rounded-2xl bg-white px-6 py-3 font-semibold text-primary-700 transition hover:scale-105"
        >
          + Add Product
        </button>
      </div>
    </section>

    <!-- STATS -->

    <section class="grid gap-6 md:grid-cols-3">
      <div class="rounded-3xl bg-white p-6 shadow-card">
        <p class="text-sm text-slate-500">Total Products</p>

        <h2 class="mt-3 text-4xl font-bold">
          {{ totalProducts }}
        </h2>
      </div>

      <div class="rounded-3xl bg-white p-6 shadow-card">
        <p class="text-sm text-slate-500">In Stock</p>

        <h2 class="mt-3 text-4xl font-bold text-green-600">
          {{ inStockProducts }}
        </h2>
      </div>

      <div class="rounded-3xl bg-white p-6 shadow-card">
        <p class="text-sm text-slate-500">Out Of Stock</p>

        <h2 class="mt-3 text-4xl font-bold text-red-500">
          {{ outOfStockProducts }}
        </h2>
      </div>
    </section>

    <!-- NAVIGATION -->

    <div class="flex flex-wrap items-center justify-between gap-5">
      <div class="inline-flex rounded-2xl bg-slate-100 p-1">
        <RouterLink
          to="/admin"
          class="rounded-xl px-5 py-2.5 font-semibold text-slate-600 transition-all"
          active-class="bg-primary-600 text-white shadow"
          exact-active-class="bg-primary-600 text-white shadow"
        >
          📊 Overview
        </RouterLink>

        <RouterLink
          to="/admin/products"
          class="rounded-xl px-5 py-2.5 font-semibold text-slate-600 transition-all"
          active-class="bg-primary-600 text-white shadow"
        >
          📦 Products
        </RouterLink>

        <RouterLink
          to="/admin/orders"
          class="rounded-xl px-5 py-2.5 font-semibold text-slate-600 transition-all"
          active-class="bg-primary-600 text-white shadow"
        >
          🛒 Orders
        </RouterLink>
      </div>

      <input
        v-model="search"
        placeholder="Search products..."
        class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary-500 lg:w-80"
      />
    </div>

    <!-- LOADING -->

    <div
      v-if="loading"
      class="rounded-3xl bg-white p-12 text-center shadow-card"
    >
      <div
        class="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      ></div>

      <p class="mt-5 text-slate-500">Loading products...</p>
    </div>

    <!-- ERROR -->

    <div
      v-else-if="error"
      class="rounded-3xl bg-white p-12 text-center shadow-card"
    >
      <h2 class="text-xl font-bold text-red-600">
        {{ error }}
      </h2>

      <button
        @click="fetchProducts"
        class="mt-6 rounded-xl bg-primary-600 px-5 py-3 text-white"
      >
        Retry
      </button>
    </div>

    <template v-else>
      <!-- ====================================== -->
      <!-- PRODUCTS TABLE -->
      <!-- ====================================== -->

      <div class="overflow-hidden rounded-3xl bg-white shadow-card">
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <h2 class="text-xl font-bold text-slate-900">Products</h2>

            <p class="mt-1 text-sm text-slate-500">
              {{ filteredProducts.length }} products found
            </p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-slate-50">
              <tr>
                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Product
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Category
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Price
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Rating
                </th>

                <th
                  class="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Stock
                </th>

                <th
                  class="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="product in filteredProducts"
                :key="product.id"
                class="transition hover:bg-slate-50"
              >
                <!-- Product -->

                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <img
                      :src="product.image"
                      :alt="product.name"
                      class="h-16 w-16 rounded-2xl border border-slate-200 bg-slate-50 object-contain p-2"
                    />

                    <div>
                      <h3 class="font-semibold text-slate-900">
                        {{ product.name }}
                      </h3>

                      <p class="mt-1 text-sm text-slate-500">
                        SKU : {{ product.sku }}
                      </p>
                    </div>
                  </div>
                </td>

                <!-- Category -->

                <td class="px-6 py-5">
                  <span
                    class="rounded-full bg-primary-50 px-3 py-1 text-sm font-medium capitalize text-primary-700"
                  >
                    {{ product.category }}
                  </span>
                </td>

                <!-- Price -->

                <td class="px-6 py-5">
                  <span class="text-lg font-bold text-primary-700">
                    ${{ product.price.toFixed(2) }}
                  </span>
                </td>

                <!-- Rating -->

                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <span class="text-yellow-500"> ⭐ </span>

                    <span class="font-semibold">
                      {{ product.rating }}
                    </span>

                    <span class="text-sm text-slate-400">
                      ({{ product.reviews }})
                    </span>
                  </div>
                </td>

                <!-- Stock -->

                <td class="px-6 py-5">
                  <div class="space-y-2">
                    <span
                      class="inline-flex rounded-full px-3 py-1 text-sm font-semibold"
                      :class="
                        product.inStock
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      "
                    >
                      {{ product.inStock ? "In Stock" : "Out of Stock" }}
                    </span>

                    <div class="text-sm text-slate-500">
                      Qty :
                      <strong>
                        {{ product.stock ?? 0 }}
                      </strong>
                    </div>
                  </div>
                </td>

                <!-- Actions -->

                <td class="px-6 py-5">
                  <div class="flex justify-end gap-3">
                    <button
                      @click="editProduct(product)"
                      class="rounded-xl bg-amber-100 px-4 py-2 font-semibold text-amber-700 transition hover:bg-amber-200"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      @click="deleteProduct(product.id)"
                      class="rounded-xl bg-red-100 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-200"
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

      <!-- ====================================== -->
      <!-- MOBILE PRODUCT CARDS -->
      <!-- ====================================== -->

      <div class="grid gap-5 lg:hidden">
        <article
          v-for="product in filteredProducts"
          :key="'mobile-' + product.id"
          class="rounded-3xl bg-white p-5 shadow-card"
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
                <span class="text-xl font-bold text-primary-700">
                  ${{ product.price.toFixed(2) }}
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
          class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >
          <!-- Header -->

          <div
            class="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-8 py-6"
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

          <div class="grid gap-8 p-8 lg:grid-cols-[2fr_1fr]">
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

              <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
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
            class="sticky bottom-0 flex justify-end gap-4 border-t bg-white px-8 py-6"
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
