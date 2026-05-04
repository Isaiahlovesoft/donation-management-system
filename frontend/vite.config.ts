/**
 * Vite config for the donation dashboard SPA.
 *
 * - `@` → `./src` import alias
 * - Dev server proxies `/donations` to the Express API on port 3001 so fetch() stays same-origin
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/donations": "http://localhost:3001",
    },
  },
});
