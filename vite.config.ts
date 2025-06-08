
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import wasm from "vite-plugin-wasm";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    wasm(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: "buffer",
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['tiny-secp256k1'],
    include: ['buffer']
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      output: {
        format: 'es'
      }
    }
  }
}));
