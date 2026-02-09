import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // Important for Electron relative paths in production
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
    global: {},
    process: {
      env: {},
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      stream: path.resolve(__dirname, "node_modules/stream-browserify"),
      buffer: path.resolve(__dirname, "node_modules/buffer"),
      process: path.resolve(__dirname, "node_modules/process/browser"),
      url: path.resolve(__dirname, "node_modules/url"),
      querystring: path.resolve(__dirname, "node_modules/querystring-es3"),
      qs: path.resolve(__dirname, "node_modules/qs"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
  },
});
