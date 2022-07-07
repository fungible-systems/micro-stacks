import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Lookup the nonce for an address from a core node
 *
 * @param {string} address - the c32check address to look up
 * @param {StacksNetwork} network - the Stacks network to look up address on
 *
 * @return a promise that resolves to an integer
 */
export async function getNonce(address: string, network?: StacksNetwork): Promise<bigint> {
  const defaultNetwork = new StacksMainnet();
  const url = network
    ? network.getAccountApiUrl(address)
    : defaultNetwork.getAccountApiUrl(address);
  const response = await fetchPrivate(url);
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error fetching nonce. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }
  const responseText = await response.text();
  const result = JSON.parse(responseText) as { nonce: string };
  return BigInt(result.nonce);
}
