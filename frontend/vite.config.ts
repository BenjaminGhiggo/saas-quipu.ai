/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    globals: true
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/shared": path.resolve(__dirname, "./src/shared"),
      "@/entities": path.resolve(__dirname, "./src/entities"),
      "@/features": path.resolve(__dirname, "./src/features"),
      "@/widgets": path.resolve(__dirname, "./src/widgets"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/app": path.resolve(__dirname, "./src/app"),
    },
  },
  server: {
    port: 5000,
    host: '0.0.0.0', // Permite conexiones externas
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:7000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', '@headlessui/react'],
          charts: ['recharts'],
        },
      },
    },
  },
})
