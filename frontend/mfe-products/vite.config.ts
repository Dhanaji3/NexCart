import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  envDir: "..",
  plugins: [
    vue(),
    federation({
      name: "mfeProducts",
      filename: "remoteEntry.js",
      exposes: {
        "./ProductList": "./src/components/ProductList.vue",
        "./ProductDetail": "./src/components/ProductDetail.vue",
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
    port: 5002,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
});
