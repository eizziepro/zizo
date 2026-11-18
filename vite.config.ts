import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, 'src/admin'),
  base: '/admin/',
  build: {
    outDir: path.resolve(__dirname, 'dist/admin'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/admin'),
    },
  },
  server: {
    port: 5173,
  },
});
