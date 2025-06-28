import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
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