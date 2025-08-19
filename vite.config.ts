import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'frontend', // where index.html lives
  build: {
    outDir: path.resolve(__dirname, 'dist'), // output to project root /dist
    emptyOutDir: true,
  },
});
