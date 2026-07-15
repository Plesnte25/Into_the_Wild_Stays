import { defineConfig } from "vite";
import tailwindscss from "tailwindcss";
import react from "@vitejs/plugin-react";
import path from "path";

//https://vite.dev/config/
export default defineConfig({
  server: {
    // Bind to all interfaces so the dev server is reachable from outside a
    // container (e.g. `docker run -p 5173:5173`), not just localhost.
    host: true,
    proxy: {
      "/api": {
        // Points at the local backend (Website/intothewilds-backend-main,
        // default PORT=5000) by default. Override with VITE_DEV_PROXY_TARGET
        // to point at a different backend (e.g. a staging deployment).
        target: process.env.VITE_DEV_PROXY_TARGET || "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
    },
  },
  plugins: [react(), tailwindscss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
