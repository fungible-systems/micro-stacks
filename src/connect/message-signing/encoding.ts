import { hashSha256 } from 'micro-stacks/crypto-sha';
import { decode, encode, encodingLength } from './varuint';
import { utf8ToBytes } from '@noble/hashes/utils';
import { concatByteArrays } from 'micro-stacks/common';

const chainPrefix = '\x18Stacks Message Signing:\n';

export function hashMessage(message: string | Uint8Array) {
  return hashSha256(encodeMessage(message));
}

export function encodeMessage(message: string | Uint8Array): Uint8Array {
  const bytes = typeof message === 'string' ? utf8ToBytes(message) : message;
  const encoded = encode(bytes.length);
  return concatByteArrays([utf8ToBytes(chainPrefix), encoded, bytes]);
}

export function decodeMessage(encodedMessage: Uint8Array): Uint8Array {
  // Remove the chain prefix: 1 for the varint and 24 for the length of the string
  // 'Stacks Message Signing:\n'
  const messageWithoutChainPrefix = encodedMessage.subarray(1 + 24);
  const decoded = decode(messageWithoutChainPrefix);
  const varIntLength = encodingLength(decoded);
  // Remove the varuint prefix
  return messageWithoutChainPrefix.slice(varIntLength);
}
