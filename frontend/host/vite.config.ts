import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      federation({
        name: "host",
        remotes: {
          mfeAuth:
            env.VITE_MFE_AUTH_URL ||
            "http://localhost:5001/assets/remoteEntry.js",
          mfeProducts:
            env.VITE_MFE_PRODUCTS_URL ||
            "http://localhost:5002/assets/remoteEntry.js",
          mfeCart:
            env.VITE_MFE_CART_URL ||
            "http://localhost:5003/assets/remoteEntry.js",
          mfeCheckout:
            env.VITE_MFE_CHECKOUT_URL ||
            "http://localhost:5004/assets/remoteEntry.js",
          mfeOrders:
            env.VITE_MFE_ORDERS_URL ||
            "http://localhost:5005/assets/remoteEntry.js",
          mfeAdmin:
            env.VITE_MFE_ADMIN_URL ||
            "http://localhost:5006/assets/remoteEntry.js",
        },
        shared: ["vue", "vue-router", "pinia", "shared"],
      }),
    ],
    build: {
      modulePreload: false,
      target: "esnext",
      minify: "terser",
      cssCodeSplit: false,
    },
    server: {
      port: 5000,
      strictPort: true,
      cors: true,
    },
    preview: {
      port: 5000,
      strictPort: true,
    },
  };
});
