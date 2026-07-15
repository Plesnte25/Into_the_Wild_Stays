import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// This admin panel is deployed as its own Hostinger sub-domain
// (e.g. admin.intothewildstays.com), not as a sub-path of the main site.
// A sub-domain serves from the web root, so `base` must be "/" for both dev
// and production builds — it must match the <BrowserRouter basename> in
// src/main.jsx. If the deploy plan ever changes to a sub-path instead
// (e.g. intothewildstays.com/admin/), update BOTH this `base` value and the
// router `basename` together, or asset URLs / client-side routing will break.
export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    proxy: {
      // Anything that starts with /api will be forwarded to the backend
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
