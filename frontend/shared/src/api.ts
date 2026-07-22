import axios from "axios";
import type {
  Product,
  User,
  Order,
  OrderCreateInput,
  ProductCreateInput,
  ProductUpdateInput,
  Category,
  OrderStatus,
} from "./types";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || "Request failed";
    const status = error.response?.status || 500;
    return Promise.reject({ status, message });
  },
);

// --- Auth API (used internally by auth store) ---

export interface LoginResponse {
  user: User;
  token: string;
}

interface AuthResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

function normalizeAuthResponse(data: AuthResponse): LoginResponse {
  return {
    user: {
      id: data.userId,
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      role: data.role.toLowerCase() as User["role"],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${data.firstName} ${data.lastName}`.trim(),
      )}`,
    },
    token: data.token,
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await http.post<AuthResponse>("/api/auth/login", {
      email,
      password,
    });
    return normalizeAuthResponse(data);
  },

  async register(
    name: string,
    email: string,
    password: string,
  ): Promise<LoginResponse> {
    const trimmedName = name.trim();
    const [firstName, ...rest] = trimmedName.split(" ");
    const lastName = rest.join(" ");

    const { data } = await http.post<AuthResponse>("/api/auth/register", {
      email,
      password,
      firstName,
      lastName,
    });
    return normalizeAuthResponse(data);
  },

  async getMe(): Promise<User> {
    const { data } = await http.get<User>("/api/auth/me");
    return data;
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const { data } = await http.put<User>("/api/auth/profile", updates);
    return data;
  },
};

// --- Cart API (used internally by cart store) ---

export interface CartApiItem {
  id: string;
  userId: number;
  productId: number;
  quantity: number;
  product: Product;
}

export const cartApi = {
  async get(): Promise<CartApiItem[]> {
    const { data } = await http.get<CartApiItem[]>("/api/cart");
    return data;
  },

  async addItem(productId: number, quantity = 1): Promise<CartApiItem[]> {
    const { data } = await http.post<CartApiItem[]>("/api/cart", {
      productId,
      quantity,
    });
    return data;
  },

  async updateQuantity(
    productId: number,
    quantity: number,
  ): Promise<CartApiItem[]> {
    const { data } = await http.put<CartApiItem[]>(`/api/cart/${productId}`, {
      quantity,
    });
    return data;
  },

  async removeItem(productId: number): Promise<void> {
    await http.delete(`/api/cart/${productId}`);
  },

  async clear(): Promise<void> {
    await http.delete("/api/cart");
  },
};

// --- Wishlist API (used internally by cart store) ---

export const wishlistApi = {
  async get(): Promise<Product[]> {
    const { data } = await http.get<Product[]>("/api/wishlist");
    return data;
  },

  async add(productId: number): Promise<Product[]> {
    const { data } = await http.post<Product[]>("/api/wishlist", { productId });
    return data;
  },

  async remove(productId: number): Promise<void> {
    await http.delete(`/api/wishlist/${productId}`);
  },
};
export const ordersApi = {
  async getAll(status?: OrderStatus): Promise<Order[]> {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const { data } = await http.get<Order[]>(`/api/orders${query}`);
    return data;
  },

  async getById(orderId: string): Promise<Order> {
    const { data } = await http.get<Order>(`/api/orders/${orderId}`);
    return data;
  },

  async create(input: OrderCreateInput): Promise<Order> {
    const { data } = await http.post<Order>("/api/orders", input);
    return data;
  },

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
  ): Promise<Order> {
    const { data } = await http.put<Order>(`/api/orders/${orderId}`, {
      status,
      trackingNumber,
    });
    return data;
  },
};

export const productsApi = {
  async getAll(params?: Record<string, unknown>): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { data } = await http.get<{
      products: Product[];
      total: number;
      page: number;
      totalPages: number;
    }>("/api/products", { params });
    return data;
  },

  async getById(productId: number): Promise<Product> {
    const { data } = await http.get<Product>(`/api/products/${productId}`);
    return data;
  },

  async create(input: ProductCreateInput): Promise<Product> {
    const { data } = await http.post<Product>("/api/products", input);
    return data;
  },

  async update(
    productId: number,
    updates: ProductUpdateInput,
  ): Promise<Product> {
    const { data } = await http.put<Product>(
      `/api/products/${productId}`,
      updates,
    );
    return data;
  },

  async delete(productId: number): Promise<void> {
    await http.delete(`/api/products/${productId}`);
  },
};

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    const { data } = await http.get<Category[]>("/api/categories");
    return data;
  },
};
