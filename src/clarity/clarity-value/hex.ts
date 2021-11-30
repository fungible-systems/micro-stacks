import { bytesToHex } from 'micro-stacks/common';
import { serializeCV } from '../serialize';
import { deserializeCV } from '../deserialize';
import { ClarityValue } from './types';

/**
 * Converts a clarity value to a hex encoded string with `0x` prefix
 * @param {ClarityValue} cv  - the clarity value to convert
 */
export function cvToHex(cv: ClarityValue) {
  return `0x${bytesToHex(serializeCV(cv))}`;
}

/**
 * Converts a hex encoded string to a clarity value
 * @param {string} hex - the hex encoded string with or without `0x` prefix
 */
export function hexToCV<T extends ClarityValue>(hex: string) {
  return deserializeCV(hex) as T;
}
