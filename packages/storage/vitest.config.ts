import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      'micro-stacks/crypto': path.resolve(__dirname, '../core/src/crypto'),
      'micro-stacks/crypto-hmac-sha': path.resolve(__dirname, '../core/src/crypto-hmac-sha'),
      'micro-stacks/crypto-aes': path.resolve(__dirname, '../core/src/crypto-aes'),
      'micro-stacks/crypto-sha': path.resolve(__dirname, '../core/src/crypto-sha'),
      'micro-stacks/common': path.resolve(__dirname, '../core/src/common'),
      'micro-stacks/zone-file': path.resolve(__dirname, '../core/src/zone-file'),
      'micro-stacks/storage': path.resolve(__dirname, '../core/src/storage'),
    },
  },
});
