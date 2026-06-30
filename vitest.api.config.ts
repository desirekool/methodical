import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./src/test/api-setup.ts'],
    include: ['src/app/api/**/__tests__/**/*.test.ts'],
    globals: true,
    fileParallelism: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage/api',
      include: ['src/app/api/**/*.ts'],
      exclude: ['src/app/api/**/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
