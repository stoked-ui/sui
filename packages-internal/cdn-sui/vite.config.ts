import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@stoked-ui/cdn': path.resolve(__dirname, '../../packages/sui-cdn/src'),
    },
  },
  server: {
    port: 4174,
    proxy: {
      '/api': {
        target: 'http://localhost:5199',
        changeOrigin: true,
        xfwd: true,
      },
    },
  },
});
