export type NodeCryptoCreateHash = typeof import('crypto').createHash;
export type NodeCryptoCreateHmac = typeof import('crypto').createHmac;

export interface Sha2Hash {
  digest(data: Uint8Array, algorithm?: 'sha256' | 'sha512'): Promise<Uint8Array>;
}

export interface Hmac {
  digest(key: Uint8Array, data: Uint8Array): Promise<Uint8Array>;
}

export interface EncryptECIESOptions {
  publicKey: string;
  content: Uint8Array;
  wasString: boolean;
  cipherTextEncoding?: CipherTextEncoding;
}

export interface DecryptECIESOptions {
  privateKey: string;
  cipherObject: CipherObject;
}

/**
 * Controls how the encrypted data buffer will be encoded as a string in the JSON payload.
 * Options:
 *    `hex` -- the legacy default, file size increase 100% (2x).
 *    `base64` -- file size increased ~33%.
 * @ignore
 */
export type CipherTextEncoding = 'hex' | 'base64';

export type CipherObject = {
  iv: string;
  ephemeralPK: string;
  cipherText: string;
  /** If undefined then hex encoding is used for the `cipherText` string. */
  cipherTextEncoding?: CipherTextEncoding;
  mac: string;
  wasString: boolean;
};

export type SignedCipherObject = {
  /** Hex encoded DER signature (up to 144 chars) */
  signature: string;
  /** Hex encoded public key (66 char length) */
  publicKey: string;
  /** The stringified json of a `CipherObject` */
  cipherText: string;
};

export interface EncryptionOptions {
  /**
   * If set to `true` the data is signed using ECDSA on SHA256 hashes with the user's
   * app private key. If a string is specified, it is used as the private key instead
   * of the user's app private key.
   * @default false
   */
  sign?: boolean | string;
  /**
   * String encoding format for the cipherText buffer.
   * Currently defaults to 'hex' for legacy backwards-compatibility.
   * Only used if the `encrypt` option is also used.
   * Note: in the future this should default to 'base64' for the significant
   * file size reduction.
   */
  cipherTextEncoding?: CipherTextEncoding;
  /**
   * Specifies if the original unencrypted content is a ASCII or UTF-8 string.
   * For example stringified JSON.
   * If true, then when the ciphertext is decrypted, it will be returned as
   * a `string` type variable, otherwise will be returned as a Buffer.
   */
  wasString?: boolean;
}

/**
 * Specify encryption options, and whether to sign the ciphertext.
 */
export interface EncryptContentOptions extends EncryptionOptions {
  /**
   * Encrypt the data with this key.
   */
  publicKey?: string;
  /**
   * Encrypt the data with the public key corresponding to the supplied private key
   */
  privateKey?: string;
}
