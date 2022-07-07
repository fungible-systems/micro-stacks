// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Aes } from 'https://deno.land/x/crypto/aes.ts';
import { Cbc, Padding } from 'https://deno.land/x/crypto/block-modes.ts';

export function aes256CbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const cipher = new Cbc(Aes, key, iv, Padding.PKCS7);
  return cipher.encrypt(plaintext);
}

export function aes256CbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  ciphertext: Uint8Array
): Promise<Uint8Array> {
  const decipher = new Cbc(Aes, key, iv, Padding.PKCS7);
  return decipher.decrypt(ciphertext);
}
