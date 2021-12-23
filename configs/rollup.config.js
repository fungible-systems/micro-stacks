import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';

const REACT_NATIVE_BUILD = !!process.env.REACT_NATIVE;
const extensions = ['.js', '.ts', '.tsx', '.json'];
const { root } = path.parse(process.cwd());

function external(id) {
  return (
    (!id.startsWith('.') && !id.startsWith(root)) ||
    id.startsWith('micro-stacks') ||
    id.startsWith('@noble') ||
    id === 'react' ||
    id === 'jotai' ||
    id === 'crypto' ||
    id.includes('.test.')
  );
}

function getEsbuild(target) {
  return esbuild({
    minify: true,
    target,
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    loaders: {
      '.ts': 'ts',
    },
    external,
    platform: 'neutral',
    tsconfig: path.resolve('./tsconfig.build.json'),
  });
}

function createDeclarationConfig(input) {
  return {
    input,
    output: {
      dir: 'dist',
    },
    external,
    plugins: [dts()],
  };
}

function createESMConfig(input, output) {
  return {
    input,
    output: {
      format: 'esm',
      file: output,
    },
    external,
    plugins: [
      resolve({ extensions }),
      json({
        compact: true,
      }),
      getEsbuild('esnext'),
    ].filter(Boolean),
  };
}

function createCommonJSConfig(input) {
  return {
    input,
    output: {
      format: 'cjs',
      globals: { react: 'React', 'react-native': 'ReactNative' },
      dir: 'dist',
    },
    external,
    plugins: [
      resolve({ extensions }),
      json({
        compact: true,
      }),
      getEsbuild('node12'),
    ].filter(Boolean),
  };
}

export default function (args) {
  let c = Object.keys(args).find(key => key.startsWith('config-'));
  const folder = REACT_NATIVE_BUILD ? `react-native/` : '';
  if (c) {
    c = c.slice('config-'.length);
    return [
      createDeclarationConfig(`src/${c}.ts`, 'dist/types'),
      createCommonJSConfig(`src/${c}.ts`, `dist/${folder}${c}.js`),
      createESMConfig(`src/${c}.ts`, `dist/esm/${folder}${c}.js`),
    ];
  }
  return [
    createDeclarationConfig('src/index.ts', 'dist'),
    createCommonJSConfig('src/index.ts', `dist/${folder}index.js`),
    createESMConfig('src/index.ts', `dist/esm/${folder}index.js`),
  ];
}
