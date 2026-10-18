import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import artifacts from './scripts/vite-artifacts.js';

export default defineConfig({
  // './' sirve igual en lukasz17git.github.io/claude-artifacts-viewer/ y en un dominio propio
  base: './',
  plugins: [react(), tailwindcss(), artifacts()],
});
