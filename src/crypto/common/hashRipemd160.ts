import Ripemd160Polyfill from './ripemd160-minimal';

export interface Ripemd160Digest {
  digest(data: Uint8Array): Uint8Array;
}

export class Ripemd160PolyfillDigest implements Ripemd160Digest {
  digest(data: Uint8Array): Uint8Array {
    return Ripemd160Polyfill(data);
  }
}

export function createHashRipemd160() {
  return new Ripemd160PolyfillDigest();
}

export function hashRipemd160(data: Uint8Array) {
  const hash = createHashRipemd160();
  return hash.digest(data);
}
