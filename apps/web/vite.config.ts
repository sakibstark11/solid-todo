import { fileRoutes } from 'filesystem-routing/vite';
import { defineConfig } from 'vite';
import solid from '@solidjs/vite-plugin';

export default defineConfig({
  plugins: [
    solid({
      start: true,
      extensions: ['.jsx', '.tsx'],
    }),
    fileRoutes({ types: true }),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
