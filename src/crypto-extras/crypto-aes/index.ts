import { createCipher } from './create-cipher';

export * from './get-crypto';

export async function aes256CbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const cipher = await createCipher();
  return cipher.encrypt('aes-256-cbc', key, iv, plaintext);
}

export async function aes256CbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  ciphertext: Uint8Array
): Promise<Uint8Array> {
  const cipher = await createCipher();
  return cipher.decrypt('aes-256-cbc', key, iv, ciphertext);
}

export async function aes128CbcEncrypt(
  iv: Uint8Array,
  key: Uint8Array,
  plaintext: Uint8Array
): Promise<Uint8Array> {
  const cipher = await createCipher();
  return cipher.encrypt('aes-128-cbc', key, iv, plaintext);
}

export async function aes128CbcDecrypt(
  iv: Uint8Array,
  key: Uint8Array,
  ciphertext: Uint8Array
): Promise<Uint8Array> {
  const cipher = await createCipher();
  return cipher.decrypt('aes-128-cbc', key, iv, ciphertext);
}
