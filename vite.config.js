import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',           // project root is frontend folder itself
  base: './',          // relative paths for assets
  build: {
    outDir: 'dist',    // outputs to frontend/dist
    emptyOutDir: true,
  },
});
