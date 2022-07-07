import {
  ensureUint8Array,
  readUInt16LE,
  readUInt32LE,
  readUInt8,
  writeUInt16LE,
  writeUInt32LE,
  writeUInt8,
} from 'micro-stacks/common';

interface Encode {
  (num: number, uint8Array?: Uint8Array, offset?: number): Uint8Array;

  bytes: number;
}

interface Decode {
  (uint8Array: Uint8Array, offset?: number): number;

  bytes: number;
}

// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;

function checkUInt53(n: number) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0) throw new RangeError('value out of range');
}

export const encode = <Encode>((
  number: number,
  uint8Array?: Uint8Array,
  offset?: number
): Uint8Array => {
  checkUInt53(number);
  let bytes;

  if (!uint8Array) uint8Array = new Uint8Array(encodingLength(number));
  if (!ensureUint8Array(uint8Array)) throw new TypeError('uint8Array must be of Uint8Array type');
  if (!offset) offset = 0;

  // 8 bit
  if (number < 0xfd) {
    writeUInt8(uint8Array, number, offset);
    bytes = 1;

    // 16 bit
  } else if (number <= 0xffff) {
    writeUInt8(uint8Array, 0xfd, offset);
    writeUInt16LE(uint8Array, number, offset + 1);
    bytes = 3;

    // 32 bit
  } else if (number <= 0xffffffff) {
    writeUInt8(uint8Array, 0xfe, offset);
    writeUInt32LE(uint8Array, number, offset + 1);
    bytes = 5;

    // 64 bit
  } else {
    writeUInt8(uint8Array, 0xff, offset);
    writeUInt32LE(uint8Array, number >>> 0, offset + 1);
    writeUInt32LE(uint8Array, (number / 0x100000000) | 0, offset + 5);
    bytes = 9;
  }

  encode.bytes = bytes;
  return uint8Array;
});

export const decode = <Decode>((uint8Array: Uint8Array, offset?: number) => {
  if (!ensureUint8Array(uint8Array)) throw new TypeError('uint8Array must be of Uint8Array type');
  if (!offset) offset = 0;
  const first = readUInt8(uint8Array, offset);

  // 8 bit
  if (first < 0xfd) {
    (decode as any).bytes = 1;
    return first;

    // 16 bit
  } else if (first === 0xfd) {
    (decode as any).bytes = 3;
    return readUInt16LE(uint8Array, offset + 1);

    // 32 bit
  } else if (first === 0xfe) {
    (decode as any).bytes = 5;
    return readUInt32LE(uint8Array, offset + 1);

    // 64 bit
  } else {
    (decode as any).bytes = 9;
    const lo = readUInt32LE(uint8Array, offset + 1);
    const hi = readUInt32LE(uint8Array, offset + 5);
    const number = hi * 0x0100000000 + lo;
    checkUInt53(number);

    return number;
  }
});

export function encodingLength(number: number) {
  checkUInt53(number);

  return number < 0xfd ? 1 : number <= 0xffff ? 3 : number <= 0xffffffff ? 5 : 9;
}
