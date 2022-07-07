import { ensureUint8Array } from 'micro-stacks/common';

import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';

export function hmacSha256(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
  const hash = hmac.create(sha256, ensureUint8Array(key));
  for (const message of messages) {
    hash.update(ensureUint8Array(message));
  }
  return Uint8Array.from(hash.digest());
}
