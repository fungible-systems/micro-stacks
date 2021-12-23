import { ripemd160 as baseRipemd160 } from '@noble/hashes/ripemd160';
import { ensureUint8Array } from 'micro-stacks/common';

export default function ripemd160(message: Uint8Array): Uint8Array;
export default function ripemd160(message: string): string;
export default function ripemd160(message: string | Uint8Array): string | Uint8Array {
  if (typeof message === 'string') {
    return baseRipemd160(message);
  } else {
    return baseRipemd160.create().update(ensureUint8Array(message)).digest();
  }
}
