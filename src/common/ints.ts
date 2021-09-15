import { isBN } from './is-bn';
import { bytesToHex, hexToBigInt, hexToBytes, intToHexString } from './encoding-hex';
import { fromTwos } from './twos-complement';

export type IntegerType = number | string | bigint | Uint8Array;

export function intToBytes(value: IntegerType, signed = false, byteOffset = 8) {
  return hexToBytes(intToHexString(intToBigInt(value, signed), byteOffset));
}

export function intToHex(value: IntegerType, signed = false, byteOffset = 8) {
  return intToHexString(intToBigInt(value, signed), byteOffset);
}

export function intToBigInt(value: IntegerType, signed = false): bigint {
  if (typeof value === 'number') {
    if (!Number.isInteger(value)) {
      throw new RangeError(`Invalid value. Values of type 'number' must be an integer.`);
    }
    return BigInt(value);
  }
  if (typeof value === 'string') {
    // If hex string then convert to buffer then fall through to the buffer condition
    if (value.toLowerCase().startsWith('0x')) {
      // Trim '0x' hex-prefix
      let hex = value.slice(2);
      // Allow odd-length strings like `0xf` -- some libs output these, or even just `0x${num.toString(16)}`
      hex = hex.padStart(hex.length + (hex.length % 2), '0');
      value = hexToBytes(hex);
    } else {
      try {
        return BigInt(value);
      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new RangeError(`Invalid value. String integer '${value}' is not finite.`);
        }
      }
    }
  }
  if (typeof value === 'bigint') {
    return value;
  }
  if (value instanceof Uint8Array) {
    if (signed) {
      // Allow byte arrays smaller than 128-bits to be passed.
      // This allows positive signed ints like `0x08` (8) or negative signed
      // ints like `0xf8` (-8) to be passed without having to pad to 16 bytes.
      return fromTwos(hexToBigInt(bytesToHex(value)));
    } else {
      return hexToBigInt(bytesToHex(value));
    }
  }
  if (isBN(value)) {
    return BigInt(value.toString());
  }
  throw new TypeError(
    `Invalid value type. Must be a number, bigint, integer-string, hex-string, BN.js instance, or Buffer, got: ${typeof value}.`
  );
}
