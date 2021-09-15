import { hmacSha512 } from 'micro-stacks/crypto-hmac-sha';

/**
 *
 * PKCS #5: Password-Based Key Derivation Function 2 (PBKDF2)
 * derived from https://github.com/aykxt/crypto/blob/main/src/pbkdf2/mod.ts
 * modified to only support hmacSha512 that bip32 uses
 * @param password
 * @param salt
 * @param iterations
 * @param keyLen
 */
export async function pbkdf2_sha512(
  password: Uint8Array,
  salt: Uint8Array,
  iterations: number,
  keyLen: number
): Promise<Uint8Array> {
  const salti = new Uint8Array(salt.length + 4);
  const saltiView = new DataView(salti.buffer);
  salti.set(salt);

  const hashLen = 64; // output size
  const len = Math.ceil(keyLen / hashLen);
  const dk = new Uint8Array(len * hashLen);
  let offset = 0;
  for (let i = 1; i <= len; i++) {
    saltiView.setUint32(salt.length, i);
    const t = await hmacSha512(password, salti);
    let u = t;

    for (let j = 1; j < iterations; j++) {
      u = await hmacSha512(password, u);
      for (let k = 0; k < hashLen; k++) t[k] ^= u[k];
    }

    dk.set(t, offset);
    offset += hashLen;
  }

  return dk.slice(0, keyLen);
}
