import { StacksNetwork } from 'micro-stacks/network';
import { ClarityAbi } from 'micro-stacks/clarity';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Fetch a contract's ABI
 *
 * @param {string} address - the contracts address
 * @param {string} contractName - the contracts name
 * @param {StacksNetwork} network - the Stacks network to broadcast transaction to
 *
 * @returns {Promise} that resolves to a ClarityAbi if the operation succeeds
 */
export async function getAbi(
  address: string,
  contractName: string,
  network: StacksNetwork
): Promise<ClarityAbi> {
  const options = {
    method: 'GET',
  };

  const url = network.getAbiApiUrl(address, contractName);

  const response = await fetchPrivate(url, options);
  if (!response.ok) {
    let msg = '';
    try {
      msg = await response.text();
    } catch (error) {}
    throw new Error(
      `Error fetching contract ABI for contract "${contractName}" at address ${address}. Response ${response.status}: ${response.statusText}. Attempted to fetch ${url} and failed with the message: "${msg}"`
    );
  }

  return JSON.parse(await response.text()) as ClarityAbi;
}
