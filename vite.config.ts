
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "", // Usa percorsi relativi al documento HTML corrente invece di percorsi assoluti
  build: {
    assetsDir: "assets",
    // Ottimizzazione chunk per performance
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor core - React essentials (caricato sempre)
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }

          // UI Components - Radix UI (caricato per UI)
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }

          // Animations - Framer Motion (può essere lazy)
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          // Admin-only libraries (caricato solo in /admin)
          if (id.includes('recharts') ||
              id.includes('jspdf') ||
              id.includes('react-beautiful-dnd') ||
              id.includes('@hello-pangea/dnd') ||
              id.includes('react-simple-maps')) {
            return 'vendor-admin';
          }

          // Date utilities
          if (id.includes('date-fns')) {
            return 'vendor-date';
          }

          // Supabase client
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }
        },
      },
    },
  },
}));
