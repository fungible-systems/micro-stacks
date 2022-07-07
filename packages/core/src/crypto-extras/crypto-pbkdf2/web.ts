import { utf8ToBytes } from 'micro-stacks/common';
import { Pbkdf2, Pbkdf2Digests } from './types';

export class WebCryptoPbkdf2 implements Pbkdf2 {
  webCrypto: Crypto;

  constructor(webCrypto: Crypto) {
    this.webCrypto = webCrypto;
  }

  async derive(
    password: string,
    salt: Uint8Array,
    iterations: number,
    keyLength: number,
    digest: Pbkdf2Digests
  ): Promise<Uint8Array> {
    let algo: string;
    if (digest === 'sha256') {
      algo = 'SHA-256';
    } else if (digest === 'sha512') {
      algo = 'SHA-512';
    } else {
      throw new Error(`Unsupported Pbkdf2 digest algorithm "${digest}"`);
    }
    const key = await this.webCrypto.subtle.importKey(
      'raw',
      utf8ToBytes(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const result: ArrayBuffer = await this.webCrypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: { name: algo },
      },
      key,
      keyLength * 8
    );
    return new Uint8Array(result);
  }
}
