// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: make modern
import { bytesToHex } from '../encoding-hex';
import { checkOffsetOrLengthValue, isEnum } from './buffer-utils';
import { ERRORS } from './buffer-constants';

// this is a combo of the buffer-reader class found in stacks.js and `smart-buffer`
export class BufferReader {
  buffer: Uint8Array;
  view: DataView;
  _readOffset = 0;

  constructor(buff?: Uint8Array) {
    if (buff) {
      this.buffer = buff;
      this.view = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
    } else {
      const buffer = new Uint8Array();
      this.buffer = buffer;
      this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    }
  }

  private ensureReadable(length: number, offset?: number) {
    // Offset value defaults to managed read offset.
    let offsetVal = this._readOffset;

    // If an offset was provided, use it.
    if (typeof offset !== 'undefined') {
      // Checks for valid numberic value;
      checkOffsetOrLengthValue(offset, true);

      // Override with custom offset.
      offsetVal = offset;
    }

    // Checks if offset is below zero, or the offset+length offset is beyond the total length of the managed data.
    if (offsetVal < 0 || offsetVal + length > this.buffer.length) {
      throw new Error(ERRORS.INVALID_READ_BEYOND_BOUNDS);
    }
  }

  private _readNumberValue<T>(func: (offset: number) => T, byteSize: number, offset?: number): T {
    this.ensureReadable(byteSize, offset);

    // Call Buffer.readXXXX();
    const value = func.call(this.view, typeof offset === 'number' ? offset : this._readOffset);

    // Adjust internal read offset if an optional read offset was not provided.
    if (typeof offset === 'undefined') {
      this._readOffset += byteSize;
    }

    return value;
  }

  readBuffer(length?: number): Uint8Array {
    const lengthVal = typeof length === 'number' ? length : this.buffer.length;
    const endPoint = Math.min(this.buffer.length, this._readOffset + lengthVal);

    // Read buffer value
    const value = this.buffer.slice(this.buffer.byteOffset + this._readOffset, endPoint);
    this._readOffset = endPoint;
    return value;
  }

  readUInt32BE(offset?: number): number {
    return this._readNumberValue(this.view.getUint32, 4, offset);
  }

  readUInt8(offset?: number): number {
    return this._readNumberValue(this.view.getUint8, 1, offset);
  }

  readUInt16BE(offset?: number): number {
    return this._readNumberValue(this.view.getUint16, 2, offset);
  }

  readBigUIntLE(length: number): BigInt {
    const buffer = Uint8Array.from(this.readBuffer(length)).reverse();
    const hex = bytesToHex(buffer);
    return BigInt(`0x${hex}`);
  }

  readBigUIntBE(length: number): BigInt {
    const buffer = this.readBuffer(length);
    const hex = bytesToHex(buffer);
    return BigInt(`0x${hex}`);
  }

  readBigUInt64BE(offset?: number): bigint {
    if (typeof BigInt === 'undefined') {
      throw new Error('Platform does not support JS BigInt type.');
    }
    return this._readNumberValue(this.view.getBigUint64, 8, offset);
  }

  get readOffset(): number {
    return this._readOffset;
  }

  set readOffset(val: number) {
    this._readOffset = val;
  }

  get internalBuffer(): ArrayBuffer {
    return this.buffer.buffer;
  }

  readUInt8Enum<T extends string, TEnumValue extends number>(
    enumVariable: { [key in T]: TEnumValue },
    invalidEnumErrorFormatter: (val: number) => Error
  ): TEnumValue {
    const num = this.readUInt8();
    if (isEnum(enumVariable, num)) {
      return num;
    } else {
      throw invalidEnumErrorFormatter(num);
    }
  }
}
