import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // frontend folder if set as root in Vercel
  base: './', // ensures assets load correctly on Vercel
  build: {
    outDir: 'dist', // relative to root
    emptyOutDir: true,
  },
});
