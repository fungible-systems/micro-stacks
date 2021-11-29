import { sha512_256 } from '@noble/hashes/lib/sha512.js';
import { ensureUint8Array } from 'micro-stacks/common';

export function hashSha512_256(data: Uint8Array): Uint8Array {
  return sha512_256.create().update(ensureUint8Array(data)).digest();
}
