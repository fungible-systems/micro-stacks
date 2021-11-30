import { ClarityValue, cvToHex } from 'micro-stacks/clarity';
import { StacksMainnet, StacksNetwork } from 'micro-stacks/network';
import { fetchPrivate } from 'micro-stacks/common';
import { parseReadOnlyResponse } from '../common/utils';

/**
 * Read only function options
 *
 * @param  {String} contractAddress - the c32check address of the contract
 * @param  {String} contractName - the contract name
 * @param  {String} functionName - name of the function to be called
 * @param  {[ClarityValue]} functionArgs - an array of Clarity values as arguments to the function call
 * @param  {StacksNetwork} network - the Stacks blockchain network this transaction is destined for
 * @param  {String} senderAddress - the c32check address of the sender
 */

export interface ReadOnlyFunctionOptions {
  contractName: string;
  contractAddress: string;
  functionName: string;
  functionArgs: ClarityValue[];
  /** the network that the contract which contains the function is deployed to */
  network?: StacksNetwork;
  /** address of the sender */
  senderAddress: string;
}

/**
 * Calls a read only function from a contract interface
 *
 * @param  {ReadOnlyFunctionOptions} readOnlyFunctionOptions - the options object
 *
 * Returns an object with a status bool (okay) and a result string that is a serialized clarity value in hex format.
 *
 * @return {ClarityValue}
 */
export async function callReadOnlyFunction(
  readOnlyFunctionOptions: ReadOnlyFunctionOptions
): Promise<ClarityValue> {
  const defaultOptions = {
    network: new StacksMainnet(),
  };

  const options = Object.assign(defaultOptions, readOnlyFunctionOptions);

  const { contractName, contractAddress, functionName, functionArgs, network, senderAddress } =
    options;

  const url = network.getReadOnlyFunctionCallApiUrl(contractAddress, contractName, functionName);

  const args = functionArgs.map(arg => cvToHex(arg));

  const body = JSON.stringify({
    sender: senderAddress,
    arguments: args,
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return response.json().then(responseJson => parseReadOnlyResponse(responseJson as any));
}
