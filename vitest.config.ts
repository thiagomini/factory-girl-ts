import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    alias: {
      '@src': './src',
      '@test': './test',
    },
    root: './',
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      '@src': './src',
      '@test': './test',
    },
  },
});
