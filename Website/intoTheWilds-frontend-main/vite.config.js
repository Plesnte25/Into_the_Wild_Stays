import { defineConfig } from "vite";
import tailwindscss from "tailwindcss";
import react from "@vitejs/plugin-react";
import path from "path";

//https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        // target: "https://intothewildstays.in",
        target: "http://localhost:5173", // Uncomment for local development
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
