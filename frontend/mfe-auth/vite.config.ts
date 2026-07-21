import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  envDir: "..",
  plugins: [
    vue(),
    federation({
      name: "mfeAuth",
      filename: "remoteEntry.js",
      exposes: {
        "./Login": "./src/components/Login.vue",
        "./Register": "./src/components/Register.vue",
        "./Profile": "./src/components/Profile.vue",
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
    port: 5001,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
});
