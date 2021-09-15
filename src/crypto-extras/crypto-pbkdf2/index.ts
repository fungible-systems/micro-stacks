import { getCryptoLib } from 'micro-stacks/crypto-aes';
import { pbkdf2_sha512 } from './pbkdf2-js-shim';
import { utf8ToBytes } from 'micro-stacks/common';
import { NodeCryptoPbkdf2 } from './node';
import { WebCryptoPbkdf2 } from './web';

import type { Pbkdf2, Pbkdf2Digests } from './types';

export async function createPbkdf2(): Promise<Pbkdf2> {
  try {
    const cryptoLib = await getCryptoLib();
    if (cryptoLib.name === 'webCrypto') return new WebCryptoPbkdf2(cryptoLib.lib);
    return new NodeCryptoPbkdf2(cryptoLib.lib.pbkdf2);
  } catch (_e) {
    return {
      derive(
        password: string,
        salt: Uint8Array,
        iterations: number,
        keyLength: number,
        _digest: Pbkdf2Digests = 'sha512'
      ): Promise<Uint8Array> {
        return pbkdf2_sha512(utf8ToBytes(password), salt, iterations, keyLength);
      },
    };
  }
}
