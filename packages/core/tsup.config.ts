import { defineConfig } from 'tsup';

const modules = [
  'api',
  'clarity',
  'connect',
  'common',
  'crypto',
  'crypto-sha',
  'crypto-hmac-sha',
  'crypto-aes',
  'crypto-pbkdf2',
  'network',
  'storage',
  'transactions',
  'wallet-sdk',
  'zone-file',
];

const external = modules.map(module => `micro-stacks/${module}`);

export default defineConfig(
  modules.map(module => ({
    entry: [`src/${module}.ts`],
    format: ['cjs', 'esm'],
    outDir: 'dist',
    splitting: true,
    treeshake: true,
    clean: false,
    target: 'node16',
    external,
    dts: true,
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  }))
);
