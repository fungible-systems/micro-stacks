// Derived from https://github.com/beatgammit/base64-js (the lib used in the node.js Buffer polyfill lib)

const base64Code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const base64urlCode = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

function getLens(b64: string) {
  const len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  let validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

// base64 is 4/3 + up to two characters of the original data
export function byteLength(b64: string) {
  const lens = getLens(b64);
  const validLen = lens[0];
  const placeHoldersLen = lens[1];
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

function _byteLength(b64: string, validLen: number, placeHoldersLen: number) {
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

export function base64ToBytesBase(b64: string, code: string) {
  const { revLookup } = getBase64Lookup(code);
  let tmp: number;
  const lens = getLens(b64);
  const validLen = lens[0];
  const placeHoldersLen = lens[1];

  const arr = new Uint8Array(_byteLength(b64, validLen, placeHoldersLen));

  let curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  let i: number;
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xff;
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  return arr;
}

function padString(input: string): string {
  const segmentLength = 4;
  const stringLength = input.length;
  const diff = stringLength % segmentLength;

  if (!diff) {
    return input;
  }

  const padLength = segmentLength - diff;
  const paddedStringLength = stringLength + padLength;
  return input.padEnd(paddedStringLength, '=');
}

export function base64ToBytes(b64: string) {
  return base64ToBytesBase(padString(b64), base64Code);
}

export function base64UrlToBytes(b64: string) {
  return base64ToBytesBase(padString(b64), base64urlCode);
}

function tripletToBase64(num: number, code: string) {
  const { lookup } = getBase64Lookup(code);
  return (
    lookup[(num >> 18) & 0x3f] +
    lookup[(num >> 12) & 0x3f] +
    lookup[(num >> 6) & 0x3f] +
    lookup[num & 0x3f]
  );
}

function encodeChunk(uint8: Uint8Array, start: number, end: number, code: string) {
  let tmp: number;
  const output: string[] = [];
  for (let i = start; i < end; i += 3) {
    tmp = ((uint8[i] << 16) & 0xff0000) + ((uint8[i + 1] << 8) & 0xff00) + (uint8[i + 2] & 0xff);
    output.push(tripletToBase64(tmp, code));
  }
  return output.join('');
}

const cacheMap = new Map();

function getBase64Lookup(code: string) {
  if (cacheMap.has(code)) return cacheMap.get(code);
  const lookup: string[] = [];
  const revLookup: number[] = [];

  for (let i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  // Support decoding URL-safe base64 strings, as Node.js does.
  // See: https://en.wikipedia.org/wiki/Base64#URL_applications
  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;

  cacheMap.set(code, { lookup, revLookup });
  return {
    lookup,
    revLookup,
  };
}

export function bytesToBase64Base(uint8: Uint8Array, code: string) {
  const { lookup } = getBase64Lookup(code);
  let tmp: number;
  const len = uint8.length;
  const extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  const parts = [];
  const maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength, code));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(lookup[tmp >> 10] + lookup[(tmp >> 4) & 0x3f] + lookup[(tmp << 2) & 0x3f] + '=');
  }

  return parts.join('');
}

export function bytesToBase64(uint8: Uint8Array) {
  return bytesToBase64Base(uint8, base64Code);
}

export function bytesToBase64Url(uint8: Uint8Array) {
  return bytesToBase64Base(uint8, base64urlCode);
}
