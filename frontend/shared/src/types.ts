// ─── Product Models ───────────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  stock: number;
  sku: string;
}

export interface ProductCreateInput {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  stock?: number;
  sku: string;
}

export type ProductUpdateInput = Partial<ProductCreateInput>;

export interface ProductFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
}

export type ProductSortOption =
  | "price-asc"
  | "price-desc"
  | "rating"
  | "name"
  | "newest";

// ─── Cart Models ──────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartSummary {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  tax: number;
  grandTotal: number;
}

// ─── User & Auth Models ───────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export type UserRole = "customer" | "admin";

export interface UserRegistrationInput {
  name: string;
  email: string;
  password: string;
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ─── Order Models ─────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;
  shippingAddress: Address;
  paymentMethod: string;
  trackingNumber?: string;
}

export interface OrderCreateInput {
  shippingAddress: Address;
  paymentMethod: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  trackingNumber?: string;
}

// ─── Address Models ───────────────────────────────────────────────────────

export interface Address {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

// ─── Category Models ──────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
}

// ─── API Response Models ──────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}

// ─── Admin Models ─────────────────────────────────────────────────────────

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  revenueByMonth: RevenueData[];
  ordersByStatus: OrderStatusCount[];
}

export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusCount {
  status: OrderStatus;
  count: number;
}

// ─── Notification Models ──────────────────────────────────────────────────

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

// ─── UI State Models ──────────────────────────────────────────────────────

export interface ModalState {
  isOpen: boolean;
  component?: string;
  props?: Record<string, unknown>;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

// ─── Pagination & Query Models ────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SortParams {
  field: string;
  order: "asc" | "desc";
}

export interface QueryParams extends PaginationParams {
  sort?: SortParams;
  filter?: Record<string, unknown>;
}
