import path from 'path';
import { defineConfig } from 'vitest/config';
// @ts-ignore
import { compilerOptions } from './tsconfig.json';

const aliases = {};
for (const [key, value] of Object.entries(compilerOptions.paths)) {
  aliases[key] = path.resolve(process.cwd(), value[0]);
}

export default defineConfig(() => {
  return {
    test: {
      environment: 'node',
      include: ['**/?(*.)+(test).(js|ts|tsx)'],
      setupFiles: ['./tests/setup.js'],
      globals: true,
      alias: aliases,
    },
  };
});
