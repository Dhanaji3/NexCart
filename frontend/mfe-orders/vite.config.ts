import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  envDir: "..",
  plugins: [
    vue(),
    federation({
      name: "mfeOrders",
      filename: "remoteEntry.js",
      exposes: {
        "./OrderList": "./src/components/OrderList.vue",
        "./OrderDetail": "./src/components/OrderDetail.vue",
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
    port: 5005,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5005,
    strictPort: true,
    cors: true,
  },
});
