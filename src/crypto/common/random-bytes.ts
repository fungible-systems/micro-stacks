import { utils } from 'noble-secp256k1';

export function getRandomBytes(size = 32): Uint8Array {
  return utils.randomBytes(size);
}
