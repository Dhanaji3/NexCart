import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  envDir: "..",
  plugins: [
    vue(),
    federation({
      name: "mfeCheckout",
      filename: "remoteEntry.js",
      exposes: {
        "./Checkout": "./src/components/Checkout.vue",
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
    port: 5004,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5004,
    strictPort: true,
    cors: true,
  },
});
