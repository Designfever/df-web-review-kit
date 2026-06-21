import { defineConfig } from 'vite';

export default defineConfig({
  root: 'dev',
  envDir: '..',
  server: {
    host: '127.0.0.1',
    port: 5177,
    strictPort: true,
    fs: {
      allow: ['..'],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5178,
    strictPort: true,
  },
  build: {
    outDir: '../dev-dist',
    emptyOutDir: true,
  },
});
