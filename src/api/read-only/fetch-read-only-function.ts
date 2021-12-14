import { callReadOnlyFunction } from './call-read-only-function';
import { cvToTrueValue } from 'micro-stacks/clarity';
import type { ReadOnlyFunctionOptions } from './types';

/**
 * Fetch and parse clarity read only function.
 *
 * This is a simple wrapper on callReadOnlyFunction to parse the clarity value into something usable in JS.
 *
 * Note: For best DX, pass the type to this function of the return value
 * @param options
 * @param strictJsonCompat If true then ints and uints are returned as JSON serializable numbers when
 * less than or equal to 53 bit length, otherwise string wrapped integers when larger than 53 bits.
 * If false, they are returned as js native `bigint`s which are _not_ JSON serializable.
 */
export async function fetchReadOnlyFunction<T>(
  options: ReadOnlyFunctionOptions,
  strictJsonCompat?: boolean
): Promise<T> {
  const value = await callReadOnlyFunction(options);
  return cvToTrueValue<T>(value, strictJsonCompat);
}
