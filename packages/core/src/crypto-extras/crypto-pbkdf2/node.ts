import { Pbkdf2, Pbkdf2Digests } from './types';

type NodePbkdf2Fn = typeof import('crypto').pbkdf2;

export class NodeCryptoPbkdf2 implements Pbkdf2 {
  nodePbkdf2: NodePbkdf2Fn;

  constructor(nodePbkdf2: NodePbkdf2Fn) {
    this.nodePbkdf2 = nodePbkdf2;
  }

  async derive(
    password: string,
    salt: Uint8Array,
    iterations: number,
    keyLength: number,
    digest: Pbkdf2Digests
  ): Promise<Uint8Array> {
    if (digest !== 'sha512' && digest !== 'sha256')
      throw new Error(`Unsupported digest "${digest}" for Pbkdf2`);
    return new Promise((resolve, reject) => {
      this.nodePbkdf2(password, salt, iterations, keyLength, digest, (error, result) => {
        if (error) reject(error);
        resolve(result);
      });
    });
  }
}
