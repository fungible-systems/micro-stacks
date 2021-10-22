import { hashRipemd160 } from 'micro-stacks/crypto';
import { hashSha256 } from 'micro-stacks/crypto-sha';

export function hash160(input: Uint8Array): Uint8Array {
  return hashRipemd160(hashSha256(input));
}

export function makeChecksum(bytes: Uint8Array): Uint8Array {
  return hashSha256(hashSha256(bytes)).slice(0, 4);
}

export function validateChecksum(buffer: Uint8Array) {
  const payload = buffer.slice(0, -4);
  const checksum = buffer.slice(-4);
  const newChecksum = makeChecksum(payload);

  const isInvalid =
    (checksum[0] ^ newChecksum[0]) |
    (checksum[1] ^ newChecksum[1]) |
    (checksum[2] ^ newChecksum[2]) |
    (checksum[3] ^ newChecksum[3]);
  if (isInvalid) throw new Error('Invalid checksum');
  return payload;
}

export function validateUint32(value: any) {
  return value >>> 0 === value;
}

const UINT31_MAX = Math.pow(2, 31) - 1;

export function validateUInt31(value: number): boolean {
  return validateUint32(value) && value <= UINT31_MAX;
}

export function validateBIP32Path(value: string): boolean {
  return (
    value === 'm' || (typeof value === 'string' && /^(m\/)?(\d+'?\/)*\d+'?$/.exec(value) !== null)
  );
}
