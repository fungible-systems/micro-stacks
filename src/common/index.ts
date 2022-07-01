import { getGlobalScope } from '../storage/common';
import { asciiToBytes } from './encoding-ascii';

export function arrayBufferToUint8(content: ArrayBuffer): Uint8Array {
  if (ArrayBuffer.isView(content)) {
    return new Uint8Array(content.buffer, content.byteOffset, content.byteLength);
  } else {
    throw new Error('Non array buffer passed to arrayBufferToUint8');
  }
}

function getAPIUsageErrorMessage(
  scopeObject: unknown,
  apiName: string,
  usageDesc?: string
): string {
  if (usageDesc) {
    return `Use of '${usageDesc}' requires \`${apiName}\` which is unavailable on the '${scopeObject}' object within the currently executing environment.`;
  } else {
    return `\`${apiName}\` is unavailable on the '${scopeObject}' object within the currently executing environment.`;
  }
}

interface GetGlobalObjectOptions {
  /**
   * Throw an error if the object is not found.
   * @default false
   */
  throwIfUnavailable?: boolean;
  /**
   * Additional information to include in an error if thrown.
   */
  usageDesc?: string;
  /**
   * If the object is not found, return an new empty object instead of undefined.
   * Requires [[throwIfUnavailable]] to be falsey.
   * @default false
   */
  returnEmptyObject?: boolean;
}

/**
 * Returns an object from the global scope (`Window` or `WorkerGlobalScope`) if it
 * is available within the currently executing environment.
 * When executing within the Node.js runtime these APIs are unavailable and will be
 * `undefined` unless the API is provided via polyfill.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
 * @ignore
 */
export function getGlobalObject<K extends Extract<keyof Window, string>>(
  name: K,
  { throwIfUnavailable, usageDesc, returnEmptyObject }: GetGlobalObjectOptions = {}
): Window[K] | undefined {
  let globalScope: Window | undefined = undefined;
  try {
    globalScope = getGlobalScope();
    if (globalScope) {
      const obj = globalScope[name];
      if (obj) {
        return obj;
      }
    }
  } catch (error) {
    console.error(`Error getting object '${name}' from global scope '${globalScope}': ${error}`);
  }
  if (throwIfUnavailable) {
    const errMsg = getAPIUsageErrorMessage(globalScope, name.toString(), usageDesc);
    console.error(errMsg);
    throw new Error(errMsg);
  }
  if (returnEmptyObject) {
    return {} as any;
  }
  return undefined;
}

export function concatByteArrays(byteArrays: Uint8Array[]): Uint8Array {
  const totalSize = byteArrays.reduce((len, bytes) => len + bytes.length, 0);
  const resultArray = new Uint8Array(totalSize);
  let offset = 0;
  for (let i = 0; i < byteArrays.length; i++) {
    resultArray.set(byteArrays[i], offset);
    offset += byteArrays[i].length;
  }
  return resultArray;
}

export function ensureUint8Array(bytes: Uint8Array): Uint8Array {
  if (typeof bytes === 'object') bytes = Uint8Array.from(bytes);
  return bytes;
}

export function validateClarityAsciiValue(value: string): { valid: true };
export function validateClarityAsciiValue(value: string): { valid: false; reason: string };
export function validateClarityAsciiValue(value: string): { valid: boolean; reason?: string } {
  // A 1-byte length prefix, up to 128
  // A variable-length string of valid ASCII characters (up to 128 bytes). This string must be accepted by the regex ^[a-zA-Z]([a-zA-Z0-9]|[-_])*$.
  // contract names, asset names, etc
  const REGEX = /^[a-zA-Z]([a-zA-Z0-9]|[-_])*$/;
  if (!REGEX.test(value)) return { valid: false, reason: 'Non-ascii characters found' };
  if (asciiToBytes(value).byteLength > 128) return { valid: false, reason: 'Too many bytes' };
  return { valid: true };
}
