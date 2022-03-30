import { CipherAlgorithm, AesCipher } from './types';

export class WebCryptoAesCipher implements AesCipher {
  webCrypto: Crypto;

  constructor(webCrypto: Crypto) {
    this.webCrypto = webCrypto;
  }

  async encrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    let algo: string;
    let length: number;
    if (algorithm === 'aes-128-cbc') {
      algo = 'AES-CBC';
      length = 128;
    } else if (algorithm === 'aes-256-cbc') {
      algo = 'AES-CBC';
      length = 256;
    } else {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cryptoKey = await this.webCrypto.subtle.importKey(
      'raw',
      key,
      { name: algo, length },
      false,
      ['encrypt']
    );
    const result: ArrayBuffer = await this.webCrypto.subtle.encrypt(
      { name: algo, iv },
      cryptoKey,
      data
    );
    return new Uint8Array(result);
  }

  async decrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array> {
    let algo: string;
    let length: number;
    if (algorithm === 'aes-128-cbc') {
      algo = 'AES-CBC';
      length = 128;
    } else if (algorithm === 'aes-256-cbc') {
      algo = 'AES-CBC';
      length = 256;
    } else {
      throw new Error(`Unsupported cipher algorithm "${algorithm}"`);
    }
    const cryptoKey = await this.webCrypto.subtle.importKey(
      'raw',
      key,
      { name: algo, length },
      false,
      ['decrypt']
    );
    const result: ArrayBuffer = await this.webCrypto.subtle.decrypt(
      { name: algo, iv },
      cryptoKey,
      data
    );
    return new Uint8Array(result);
  }
}
