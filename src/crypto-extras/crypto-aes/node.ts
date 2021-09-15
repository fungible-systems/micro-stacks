import { concatByteArrays } from 'micro-stacks/common';
import { AesCipher, CipherAlgorithm } from './types';

type NodeCryptoCreateCipher = typeof import('crypto').createCipheriv;
type NodeCryptoCreateDecipher = typeof import('crypto').createDecipheriv;

export class NodeCryptoAesCipher implements AesCipher {
  createCipher: NodeCryptoCreateCipher;
  createDecipher: NodeCryptoCreateDecipher;

  constructor(createCipher: NodeCryptoCreateCipher, createDecipher: NodeCryptoCreateDecipher) {
    this.createCipher = createCipher;
    this.createDecipher = createDecipher;
  }

  async encrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    if (algorithm !== 'aes-128-cbc' && algorithm !== 'aes-256-cbc') {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cipher = this.createCipher(algorithm, key, iv);
    const result = concatByteArrays([cipher.update(data), cipher.final()]);
    return Promise.resolve(result);
  }

  async decrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    if (algorithm !== 'aes-128-cbc' && algorithm !== 'aes-256-cbc') {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cipher = this.createDecipher(algorithm, key, iv);
    const result = concatByteArrays([cipher.update(data), cipher.final()]);
    return Promise.resolve(result);
  }
}
