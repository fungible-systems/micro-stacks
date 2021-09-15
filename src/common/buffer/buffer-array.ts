import { hexToBytes } from '../encoding-hex';
import { concatByteArrays } from '../index';

export class BufferArray {
  _value: Uint8Array[] = [];
  get value() {
    return this._value;
  }

  appendHexString(hexString: string) {
    this.value.push(hexToBytes(hexString));
  }

  push(buffer: Uint8Array) {
    return this._value.push(buffer);
  }

  appendByte(octet: number) {
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      throw new Error(`Value ${octet} is not a valid byte`);
    }
    this.value.push(Uint8Array.from([octet]));
  }

  concatBuffer(): Uint8Array {
    return concatByteArrays(this.value);
  }
}
