import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // En desarrollo, Vite (5173) reenvía la API y los artefactos al servidor Node (3000)
    proxy: {
      '/api': 'http://localhost:3000',
      '/a/': 'http://localhost:3000',
    },
  },
});
