import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  envDir: "..",
  plugins: [
    vue(),
    federation({
      name: "mfeAdmin",
      filename: "remoteEntry.js",
      exposes: {
        "./AdminDashboard": "./src/components/AdminDashboard.vue",
        "./AdminProducts": "./src/components/AdminProducts.vue",
        "./AdminOrders": "./src/components/AdminOrders.vue",
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
    port: 5006,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5006,
    strictPort: true,
    cors: true,
  },
});
