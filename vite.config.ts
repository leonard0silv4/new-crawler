import path from "path"
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'react-virtualized/List': 'react-virtualized/dist/es/List',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'react';
          if (id.includes('node_modules/@radix-ui') || id.includes('shadcn')) return 'ui';
        }
      }
    }
  }
})