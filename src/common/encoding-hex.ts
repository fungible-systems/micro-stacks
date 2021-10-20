import { IntegerType, intToBigInt } from './ints';
import { bytesToUtf8 } from './encoding-utf8';

const byteToHexCache: string[] = new Array(0xff);

for (let n = 0; n <= 0xff; ++n) {
  byteToHexCache[n] = n.toString(16).padStart(2, '0');
}

export function hexToBytes(hex: string): Uint8Array {
  if (typeof hex !== 'string')
    throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
  if (hex.length % 2)
    throw new Error(`hexToBytes: received invalid unpadded hex, got: ${hex.length}`);
  const array = new Uint8Array(hex.length / 2);
  for (let i = 0; i < array.length; i++) {
    const j = i * 2;
    array[i] = Number.parseInt(hex.slice(j, j + 2), 16);
  }
  return array;
}

export function bytesToHex(uint8a: Uint8Array) {
  const hexOctets = new Array(uint8a.length);
  for (let i = 0; i < uint8a.length; ++i) hexOctets[i] = byteToHexCache[uint8a[i]];
  return hexOctets.join('');
}

export function numberToHex(num: number | bigint): string {
  const hex = num.toString(16);
  return hex.length & 1 ? `0${hex}` : hex;
}

export function hexToBigInt(hex: string): bigint {
  if (typeof hex !== 'string')
    throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
  // Big Endian
  return BigInt(`0x${hex}`);
}

export const intToHexString = (integer: IntegerType, lengthBytes = 8): string => {
  const value = typeof integer === 'bigint' ? integer : intToBigInt(integer, false);
  return value.toString(16).padStart(lengthBytes * 2, '0');
};

export const hexStringToInt = (hexString: string): number => parseInt(hexString, 16);

export const hexToJSON = (hex: string) => JSON.parse(bytesToUtf8(hexToBytes(hex)));

export const ensureHexBytes = (bytesOrHex: string | Uint8Array): Uint8Array =>
  typeof bytesOrHex === 'string' ? hexToBytes(bytesOrHex) : bytesOrHex;

export const cleanHex = (hexMaybePrefixed: string): string => {
  if (!hexMaybePrefixed.startsWith('0x')) return hexMaybePrefixed;
  return hexMaybePrefixed.replace('0x', '');
};
