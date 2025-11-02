import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/admin/" : "/",
  server: {
    proxy: {
      // Anything that starts with /api will be forwarded to the backend
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
}));
