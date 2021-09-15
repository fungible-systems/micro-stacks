import { WebCryptoAesCipher } from './web';
import { NodeCryptoAesCipher } from './node';
import type { AesCipher } from './types';
import { getCryptoLib } from './get-crypto';

export async function createCipher(): Promise<AesCipher> {
  const cryptoLib = await getCryptoLib();
  if (cryptoLib.name === 'webCrypto') {
    return new WebCryptoAesCipher(cryptoLib.lib);
  } else {
    return new NodeCryptoAesCipher(cryptoLib.lib.createCipheriv, cryptoLib.lib.createDecipheriv);
  }
}
