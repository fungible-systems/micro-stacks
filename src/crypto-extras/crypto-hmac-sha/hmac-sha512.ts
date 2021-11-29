import { hmac } from '@noble/hashes/lib/hmac.js';
import { sha512 } from '@noble/hashes/lib/sha512.js';
import { ensureUint8Array } from 'micro-stacks/common';

export function hmacSha512(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
  const hash = hmac.create(sha512, ensureUint8Array(key));
  for (const message of messages) {
    hash.update(ensureUint8Array(message));
  }
  return Uint8Array.from(hash.digest());
}

// export function hmacSha512Shim(key: Uint8Array, ...messages: Uint8Array[]): Uint8Array {
//   const input = messages.length === 1 ? messages[0] : concatByteArrays(messages);
//   return new Hmac(new Sha512()).init(key).update(input).digest();
// }
