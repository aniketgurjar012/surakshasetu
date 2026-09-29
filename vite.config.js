import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0"
  },
  preview: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 4173,
    strictPort: true,
    allowedHosts: ["surakshasetu-7tuc.onrender.com"]
  },
  build: {
    target: "es2019",
    cssCodeSplit: true
  }
});