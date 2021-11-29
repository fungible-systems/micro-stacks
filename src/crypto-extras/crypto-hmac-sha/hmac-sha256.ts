import { ensureUint8Array } from 'micro-stacks/common';

import { hmac } from '@noble/hashes/lib/hmac.js';
import { sha256 } from '@noble/hashes/lib/sha256.js';

export function hmacSha256(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
  const hash = hmac.create(sha256, ensureUint8Array(key));
  for (const message of messages) {
    hash.update(ensureUint8Array(message));
  }
  return Uint8Array.from(hash.digest());
}
