import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "shared";
import HomeView from "../views/HomeView.vue";

// Wrapper for remote module imports with error handling
function loadRemote(loader: () => Promise<any>) {
  return () => loader().catch(() => import("../views/RemoteError.vue"));
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: loadRemote(() => import("mfeAuth/Login")),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "register",
    component: loadRemote(() => import("mfeAuth/Register")),
    meta: { guest: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: loadRemote(() => import("mfeAuth/Profile")),
    meta: { requiresAuth: true },
  },
  {
    path: "/products",
    name: "products",
    component: loadRemote(() => import("mfeProducts/ProductList")),
  },
  {
    path: "/products/:id",
    name: "product-detail",
    component: loadRemote(() => import("mfeProducts/ProductDetail")),
  },
  {
    path: "/cart",
    name: "cart",
    component: loadRemote(() => import("mfeCart/Cart")),
  },
  {
    path: "/wishlist",
    name: "wishlist",
    component: loadRemote(() => import("mfeCart/Wishlist")),
  },
  {
    path: "/checkout",
    name: "checkout",
    component: loadRemote(() => import("mfeCheckout/Checkout")),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "orders",
    component: loadRemote(() => import("mfeOrders/OrderList")),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    name: "order-detail",
    component: loadRemote(() => import("mfeOrders/OrderDetail")),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: loadRemote(() => import("mfeAdmin/AdminDashboard")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/products",
    name: "admin-products",
    component: loadRemote(() => import("mfeAdmin/AdminProducts")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/orders",
    name: "admin-orders",
    component: loadRemote(() => import("mfeAdmin/AdminOrders")),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0 };
  },
});

// Navigation Guards
router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user && !auth.loading) {
    await auth.fetchUser();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: "home" });
  } else if (to.meta.guest && auth.isAuthenticated) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
