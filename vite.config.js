import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => ({
  base: loadEnv(mode, process.cwd(), "").VITE_BASE_PATH || "/",
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
}));
