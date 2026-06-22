import { defineConfig } from 'vite';
import { reviewSourceLocator } from '../src/vite';

export default defineConfig({
  root: 'dev',
  envDir: '..',
  plugins: [
    reviewSourceLocator({
      enabled: true,
      filePath: 'absolute',
      include: ['src'],
    }),
  ],
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
