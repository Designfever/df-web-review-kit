import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test.setup.ts'],
    restoreMocks: true,
    clearMocks: true,
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
  },
});
