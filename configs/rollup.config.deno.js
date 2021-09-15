import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';
import replace from '@rollup/plugin-replace';
import deno from './rollup-deno-plugin';
import { DENO_NOBLE_URL, makePackageDenoUrls, packages } from './shared';

const extensions = ['.js', '.ts', '.tsx'];
const { root } = path.parse(process.cwd());

function external(id) {
  return (
    (!id.startsWith('.') && !id.startsWith(root)) ||
    id === 'react' ||
    id === 'jotai' ||
    id.includes('.test.') ||
    id === 'node' ||
    id === 'crypto' ||
    id.includes('node')
  );
}

function getEsbuild(target) {
  return esbuild({
    minify: false,
    target,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loaders: {
      '.ts': 'ts',
    },
    tsconfig: path.resolve('./tsconfig.build.json'),
  });
}

function createDeclarationConfig(input, output) {
  return {
    input,
    output: {
      dir: output,
    },
    external,
    plugins: [
      typescript({
        declaration: true,
        outDir: output,
        tsconfig: path.resolve('./tsconfig.build.json'),
      }),
    ],
  };
}

function createDenoConfig(input, output) {
  return {
    input,
    output: {
      file: output,
      format: 'esm',
    },
    external,
    plugins: [
      deno(),
      resolve({ extensions }),
      replace({
        [`from 'noble-secp256k1';`]: `from '${DENO_NOBLE_URL}';`,
        ...makePackageDenoUrls(packages),
        delimiters: ['', ''],
      }),
      getEsbuild('esnext'),
    ],
  };
}

export default function (args) {
  let c = Object.keys(args).find(key => key.startsWith('config-'));
  if (c) {
    c = c.slice('config-'.length);
    const isAes = c === 'crypto-aes';
    return [
      createDeclarationConfig(isAes ? 'src/crypto-aes/mod.ts' : `src/${c}.ts`, 'deno/types'),
      createDenoConfig(isAes ? 'src/crypto-aes/mod.ts' : `src/${c}.ts`, `deno/${c}.js`),
    ];
  }
}
