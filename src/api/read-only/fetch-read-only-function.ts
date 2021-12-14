import { callReadOnlyFunction } from './call-read-only-function';
import { cvToTrueValue } from 'micro-stacks/clarity';

import { ReadOnlyFunctionOptions } from './types';

/**
 * Fetch and parse clarity read only function.
 *
 * This is a simple wrapper on callReadOnlyFunction to parse the clarity value into something usable in JS.
 *
 * Note: For best DX, pass the type to this function of the return value
 * @param options
 */
export async function fetchReadOnlyFunction<T>(options: ReadOnlyFunctionOptions): Promise<T> {
  const value = await callReadOnlyFunction(options);
  return cvToTrueValue<T>(value);
}
