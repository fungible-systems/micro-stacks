import { base64ToBytes, bytesToBase64 } from 'micro-stacks/common';

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

function encode(input: string | Uint8Array): string {
  if (input instanceof Uint8Array) {
    return fromBase64(bytesToBase64(input));
  }
  return fromBase64(bytesToBase64(new TextEncoder().encode(input)));
}

function decode(base64url: string): string {
  const bytes = base64ToBytes(toBase64(base64url));
  return new TextDecoder().decode(bytes);
}

export function toBase64(base64url: string | Uint8Array): string {
  // We this to be a string so we can do .replace on it. If it's
  // already a string, this is a noop.
  let str: string;
  if (base64url instanceof Uint8Array) {
    str = new TextDecoder().decode(base64url);
  } else {
    str = base64url;
  }
  return padString(str).replace(/\-/g, '+').replace(/_/g, '/');
}

export function fromBase64(base64: string): string {
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

export default {
  encode,
  decode,
};
