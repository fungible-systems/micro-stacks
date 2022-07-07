import { ERRORS } from './buffer-constants';

export function writeUInt8(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset = offset >>> 0;
  buffer[offset] = value & 0xff;
  return offset + 1;
}

export function writeUInt16LE(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset = offset >>> 0;
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = value >>> 8;
  return offset + 2;
}

export function writeUInt16BE(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset = offset >>> 0;
  buffer[offset] = value >>> 8;
  buffer[offset + 1] = value & 0xff;
  return offset + 2;
}

export function readUInt8(buffer: Uint8Array, offset: number) {
  offset = offset >>> 0;
  return buffer[offset];
}

export function readUInt16LE(buffer: Uint8Array, offset: number) {
  offset = offset >>> 0;
  return buffer[offset] | (buffer[offset + 1] << 8);
}

export function readInt32LE(buffer: Uint8Array, offset: number): number {
  offset >>>= 0;
  return (
    buffer[offset] |
    (buffer[offset + 1] << 8) |
    (buffer[offset + 2] << 16) |
    (buffer[offset + 3] << 24)
  );
}

export function readUInt32LE(buffer: Uint8Array, offset: number): number {
  offset = offset >>> 0;

  return (
    (buffer[offset] | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16)) +
    buffer[offset + 3] * 0x1000000
  );
}

export function readUInt32BE(buffer: Uint8Array, offset: number) {
  offset = offset >>> 0;

  return (
    buffer[offset] * 0x1000000 +
    ((buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3])
  );
}

export function writeUInt32LE(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset >>>= 0;
  buffer[offset + 3] = value >>> 24;
  buffer[offset + 2] = value >>> 16;
  buffer[offset + 1] = value >>> 8;
  buffer[offset] = value & 0xff;
  return offset + 4;
}

export function writeInt32LE(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset >>>= 0;
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = value >>> 8;
  buffer[offset + 2] = value >>> 16;
  buffer[offset + 3] = value >>> 24;
  return offset + 4;
}

export function writeUInt32BE(buffer: Uint8Array, value: number, offset: number): number {
  value = +value;
  offset >>>= 0;
  buffer[offset] = value >>> 24;
  buffer[offset + 1] = value >>> 16;
  buffer[offset + 2] = value >>> 8;
  buffer[offset + 3] = value & 0xff;
  return offset + 4;
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance(obj: any, type: any) {
  return (
    obj instanceof type ||
    (obj != null &&
      obj.constructor != null &&
      obj.constructor.name != null &&
      obj.constructor.name === type.name)
  );
}

export function compare(a: Uint8Array, b: Uint8Array) {
  if (!isInstance(a, Uint8Array) || !isInstance(b, Uint8Array)) {
    throw new TypeError('The "buf1", "buf2" arguments must be one of type Uint8Array');
  }

  if (a === b) return 0;

  let x = a.length;
  let y = b.length;

  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break;
    }
  }

  if (x < y) return -1;
  if (y < x) return 1;
  return 0;
}

/**
 * Reads a Uint8Array from the internal read position.
 */
export function readBuffer(buffer: Uint8Array, length?: number): Uint8Array {
  const lengthVal = typeof length === 'number' ? length : buffer.length;
  const endPoint = Math.min(buffer.length, buffer.byteOffset + lengthVal);

  // Read buffer value
  return buffer.slice(buffer.byteOffset, endPoint);
}

function createEnumChecker<T extends string, TEnumValue extends number>(enumVariable: {
  [key in T]: TEnumValue;
}): (value: number) => value is TEnumValue {
  // Create a set of valid enum number values.
  const enumValues = Object.values<number>(enumVariable).filter(v => typeof v === 'number');
  const enumValueSet = new Set<number>(enumValues);
  return (value: number): value is TEnumValue => enumValueSet.has(value);
}

// eslint-disable-next-line @typescript-eslint/ban-types
const enumCheckFunctions = new Map<object, (value: number) => boolean>();

/**
 * Type guard to check if a given value is a valid enum value.
 * @param enumVariable - Literal `enum` type.
 * @param value - A value to check against the enum's values.
 * @example
 * ```ts
 * enum Color {
 *   Purple = 3,
 *   Orange = 5
 * }
 * const val: number = 3;
 * if (isEnum(Color, val)) {
 *   // `val` is known as enum type `Color`, e.g.:
 *   const colorVal: Color = val;
 * }
 * ```
 */
export function isEnum<T extends string, TEnumValue extends number>(
  enumVariable: { [key in T]: TEnumValue },
  value: number
): value is TEnumValue {
  const checker = enumCheckFunctions.get(enumVariable);
  if (checker !== undefined) {
    return checker(value);
  }
  const newChecker = createEnumChecker(enumVariable);
  enumCheckFunctions.set(enumVariable, newChecker);
  return isEnum(enumVariable, value);
}

/**
 * Determines whether a given number is a integer.
 * @param value The number to check.
 */
export function isInteger(value: number) {
  return typeof value === 'number' && isFinite(value) && Math.floor(value) === value;
}

/**
 * Checks if a given number is a finite integer. (Throws an exception if check fails)
 *
 * @param { Number } value The number value to check.
 */
export function isFiniteInteger(value: number): boolean {
  return typeof value === 'number' && isFinite(value) && isInteger(value);
}

/**
 * Checks if an offset/length value is valid. (Throws an exception if check fails)
 *
 * @param value The value to check.
 * @param offset True if checking an offset, false if checking a length.
 */
export function checkOffsetOrLengthValue(value: any, offset: boolean) {
  if (typeof value === 'number') {
    // Check for non finite/non integers
    if (!isFiniteInteger(value) || value < 0) {
      throw new Error(offset ? ERRORS.INVALID_OFFSET : ERRORS.INVALID_LENGTH);
    }
  } else {
    throw new Error(offset ? ERRORS.INVALID_OFFSET_NON_NUMBER : ERRORS.INVALID_LENGTH_NON_NUMBER);
  }
}
