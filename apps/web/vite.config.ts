import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';

const API_TARGET = process.env.API_URL ?? 'http://localhost:3001';

export default defineConfig({
  plugins: [
    solid({
      start: true,
      extensions: ['.jsx', '.tsx'],
    }),
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
