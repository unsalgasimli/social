import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'frontend',      // frontend folder is the root
  base: './',            // relative paths
  build: {
    outDir: 'dist',      // will create frontend/dist
    emptyOutDir: true,
  },
});
