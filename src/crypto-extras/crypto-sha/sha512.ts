import { sha512 } from 'noble-hashes/lib/sha512.js';
import { ensureUint8Array } from 'micro-stacks/common';

export function hashSha512(data: Uint8Array): Uint8Array {
  return sha512.create().update(ensureUint8Array(data)).digest();
}
