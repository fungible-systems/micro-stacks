import { bytesToHex } from 'micro-stacks/common';
import { serializeCV } from '../serialize';
import { deserializeCV } from '../deserialize';
import { cvToValue } from './cv-to-value';
import { cvToTrueValue } from './cv-to-true-value';
import type { ClarityValue } from './types';

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

/**
 * Converts a hex encoded string to the javascript clarity value object {type: string; value: any}
 * @param {string} hex - the hex encoded string with or without `0x` prefix
 * @param {boolean} jsonCompat - enable to serialize bigints to strings
 */
export function hexToCvValue<T>(hex: string, jsonCompat = true) {
  return cvToValue(hexToCV(hex), jsonCompat) as T;
}

/**
 * Converts a hex encoded string to the pure javascript value
 * @param {string} hex - the hex encoded string with or without `0x` prefix
 * @param {boolean} jsonCompat - enable to serialize bigints to strings
 */
export function hexToValue<T>(hex: string, jsonCompat = true) {
  return cvToTrueValue(hexToCV(hex), jsonCompat) as T;
}
