import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  splitting: true,
  treeshake: true,
  clean: true,
  target: 'node16',
  external: [
    'micro-stacks/api',
    'micro-stacks/clarity',
    'micro-stacks/common',
    'micro-stacks/connect',
    'micro-stacks/crypto',
    'micro-stacks/crypto-extras',
    'micro-stacks/network',
    'micro-stacks/storage',
    'micro-stacks/transactions',
    'micro-stacks/wallet-sdk',
    'micro-stacks/zone-file',
  ],
  dts: true,
  minify: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  minifyWhitespace: true,
});
