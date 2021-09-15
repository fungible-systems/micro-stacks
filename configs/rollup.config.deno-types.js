import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import dts from 'rollup-plugin-dts';
import { makePackageDenoUrls, packages } from './shared';

const extensions = ['.js', '.ts', '.tsx'];
const { root } = path.parse(process.cwd());

function external(id) {
  return (
    (!id.startsWith('.') && !id.startsWith(root)) ||
    id === 'react' ||
    id === 'jotai' ||
    id.includes('.test.') ||
    id === 'node' ||
    id === 'crypto'
  );
}

function createCombinedDeclarationConfig(input) {
  return {
    input,
    output: {
      file: input.replace('deno/types/', 'deno/'),
    },
    external,
    plugins: [
      resolve({ extensions }),
      replace({
        preventAssignment: true,
        values: makePackageDenoUrls(packages, 'd.ts'),
      }),
      dts(),
      cleanTypesPlugin(),
    ],
  };
}

const cryptoTypes = `import * as crypto from 'crypto';

declare type NodeCryptoCreateHash = typeof crypto.createHash;
declare type NodeCryptoCreateHmac = typeof crypto.createHmac;
`;

const exportTypes = `NodeCryptoCreateHash, NodeCryptoCreateHmac, `;

const nodeTypes = `/// <reference types="node" />
import * as crypto from 'crypto';`;

const cleanTypesPlugin = () => {
  return {
    name: 'denoRemoveNode',
    // Breaks sourcemap, but whatever
    renderChunk(code, details) {
      const filename = details.fileName.split('.')[0];
      if (filename === 'crypto')
        return code.replace(nodeTypes, '').replace(cryptoTypes, '').replace(exportTypes, '');
      return code;
    },
  };
};

export default function (args) {
  let c = Object.keys(args).find(key => key.startsWith('config-'));
  if (c) {
    c = c.slice('config-'.length);
    return [createCombinedDeclarationConfig(`deno/types/${c}.d.ts`)];
  }
}
