import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';
import { ensureUint8Array } from 'micro-stacks/common';

export function hmacSha512(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
  const hash = hmac.create(sha512, ensureUint8Array(key));
  for (const message of messages) {
    hash.update(ensureUint8Array(message));
  }
  return Uint8Array.from(hash.digest());
}
