import { hashSha256 } from 'micro-stacks/crypto-sha';
import { decode, encode, encodingLength } from './varuint';
import { utf8ToBytes } from '@noble/hashes/utils';
import { concatByteArrays } from 'micro-stacks/common';

const chainPrefix = '\x17Stacks Signed Message:\n';
const chainPrefixBytes = utf8ToBytes(chainPrefix);

export function hashMessage(message: string | Uint8Array) {
  return hashSha256(encodeMessage(message));
}

export function encodeMessage(message: string | Uint8Array): Uint8Array {
  const bytes = typeof message === 'string' ? utf8ToBytes(message) : message;
  const encoded = encode(bytes.length);
  return concatByteArrays([chainPrefixBytes, encoded, bytes]);
}

export function decodeMessage(encodedMessage: Uint8Array): Uint8Array {
  const messageWithoutChainPrefix = encodedMessage.subarray(chainPrefixBytes.byteLength);
  const decoded = decode(messageWithoutChainPrefix);
  const varIntLength = encodingLength(decoded);
  // Remove the varuint prefix
  return messageWithoutChainPrefix.slice(varIntLength);
}
