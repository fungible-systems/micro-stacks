import { hashSha256 } from 'micro-stacks/crypto-sha';
import { decode, encode, encodingLength } from './varuint';
import { utf8ToBytes } from '@noble/hashes/utils';
import { concatByteArrays } from 'micro-stacks/common';

const CHAIN_PREFIX = '\x17Stacks Signed Message:\n';
export const CHAIN_PREFIX_BYTES = utf8ToBytes(CHAIN_PREFIX);
const LEGACY_CHAIN_PREFIX = '\x18Stacks Message Signing:\n';
export const LEGACY_CHAIN_PREFIX_BYTES = utf8ToBytes(LEGACY_CHAIN_PREFIX);

export function hashMessage(message: string | Uint8Array, prefix: Uint8Array = CHAIN_PREFIX_BYTES) {
  return hashSha256(encodeMessage(message, prefix));
}

export function encodeMessage(
  message: string | Uint8Array,
  prefix: Uint8Array = CHAIN_PREFIX_BYTES
): Uint8Array {
  const bytes = typeof message === 'string' ? utf8ToBytes(message) : message;
  const encoded = encode(bytes.length);
  return concatByteArrays([prefix, encoded, bytes]);
}

export function decodeMessage(
  encodedMessage: Uint8Array,
  prefix: Uint8Array = CHAIN_PREFIX_BYTES
): Uint8Array {
  const messageWithoutChainPrefix = encodedMessage.subarray(prefix.byteLength);
  const decoded = decode(messageWithoutChainPrefix);
  const varIntLength = encodingLength(decoded);
  // Remove the varuint prefix
  return messageWithoutChainPrefix.slice(varIntLength);
}
