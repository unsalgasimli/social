import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.', // if vite.config.ts is in the same folder as index.html
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
  },
});
