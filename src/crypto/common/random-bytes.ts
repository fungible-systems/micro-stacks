import { utils } from 'noble-secp256k1';

export function getRandomBytes(size: number): Uint8Array {
  return utils.randomBytes(size);
}
