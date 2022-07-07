export type CipherAlgorithm = 'aes-256-cbc' | 'aes-128-cbc';
export interface AesCipher {
  encrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array>;

  decrypt(
    algorithm: CipherAlgorithm,
    key: Uint8Array,
    iv: Uint8Array,
    data: Uint8Array
  ): Promise<Uint8Array>;
}
