import type { ClarityValue } from 'micro-stacks/clarity';
import { cvToHex } from 'micro-stacks/clarity';
import { StacksMainnet, StacksTestnet } from 'micro-stacks/network';
import { fetchPrivate } from 'micro-stacks/common';

import { isMainnetAddress, parseReadOnlyResponse } from './utils';

import type { ReadOnlyFunctionOptions, ReadOnlyFunctionResponse } from './types';

/**
 * Calls a read only function from a contract interface
 *
 * @param  {ReadOnlyFunctionOptions} options - the options object
 *
 * Returns an object with a status bool (okay) and a result string that is a serialized clarity value in hex format.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/smart-contracts#fetchreadonlyfunction
 * @return {ClarityValue}
 */
export async function callReadOnlyFunction<T extends ClarityValue>(
  options: ReadOnlyFunctionOptions
): Promise<T> {
  const {
    contractName,
    contractAddress,
    functionName,
    functionArgs,
    senderAddress = contractAddress,
    tip,
  } = options;

  let network = options.network;
  if (!options.network) {
    try {
      network = isMainnetAddress(contractAddress) ? new StacksMainnet() : new StacksTestnet();
    } catch (e) {
      console.error(e);
      throw new Error(
        '[micro-stacks] callReadOnlyFunction -> Incorrect Stacks addressed passed to contractAddress'
      );
    }
  }

  if (!network) throw Error('[micro-stacks] callReadOnlyFunction -> no network defined');

  let url = network.getReadOnlyFunctionCallApiUrl(contractAddress, contractName, functionName);
  if (tip) {
    url += `?tip=${tip}`;
  }

  const body = JSON.stringify({
    sender: senderAddress,
    arguments: functionArgs.map(arg => (typeof arg === 'string' ? arg : cvToHex(arg))),
  });

  const response = await fetchPrivate(url, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error calling read-only function. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }

  return parseReadOnlyResponse((await response.json()) as ReadOnlyFunctionResponse) as T;
}
