/*! micro-base58 - MIT License (c) 2021, Paul Miller (https://paulmillr.com) */

import { bytesToHex } from './encoding-hex';

/* See https://github.com/paulmillr/micro-base58 */

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const _58n = BigInt(58);

export function encodeB58(source: string | Uint8Array) {
  if (source.length === 0) return '';
  if (typeof source === 'string') {
    if (typeof TextEncoder !== 'undefined') {
      source = new TextEncoder().encode(source);
    } else {
      // note: only supports ASCII
      source = new Uint8Array(source.split('').map(c => c.charCodeAt(0)));
    }
  }

  // Convert Uint8Array to BigInt, Big Endian.
  let x = BigInt('0x' + bytesToHex(source));

  const output = [];

  while (x > 0) {
    const mod = Number(x % _58n);
    x = x / _58n;
    output.push(B58_ALPHABET[mod]);
  }

  for (let i = 0; source[i] === 0; i++) {
    output.push(B58_ALPHABET[0]);
  }

  return output.reverse().join('');
}

export function decodeB58(output: string) {
  if (output.length === 0) return new Uint8Array([]);
  const bytes = [0];
  for (let i = 0; i < output.length; i++) {
    const char = output[i];
    const value = B58_ALPHABET.indexOf(char);
    if (value === undefined) {
      throw new Error(
        `base58.decode received invalid input. Character '${char}' is not in the base58 alphabet.`
      );
    }
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] *= 58;
    }
    bytes[0] += value;
    let carry = 0;
    for (let j = 0; j < bytes.length; j++) {
      bytes[j] += carry;
      carry = bytes[j] >> 8;
      bytes[j] &= 0xff;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  for (let i = 0; i < output.length && output[i] === '1'; i++) {
    bytes.push(0);
  }
  return new Uint8Array(bytes.reverse());
}
