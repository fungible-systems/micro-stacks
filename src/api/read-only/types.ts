import { ClarityValue } from 'micro-stacks/clarity';
import { StacksNetwork } from 'micro-stacks/network';

export interface ReadOnlyFunctionSuccessResponse {
  okay: true;
  result: string;
}

export interface ReadOnlyFunctionErrorResponse {
  okay: false;
  cause: string;
}

export type ReadOnlyFunctionResponse =
  | ReadOnlyFunctionSuccessResponse
  | ReadOnlyFunctionErrorResponse;

/**
 * Read only function options
 *
 * @param  {String} contractAddress - the c32check address of the contract
 * @param  {String} contractName - the contract name
 * @param  {String} functionName - name of the function to be called
 * @param  {[ClarityValue]} functionArgs - an array of Clarity values as arguments to the function call
 * @param  {StacksNetwork} network - the Stacks blockchain network this transaction is destined for
 * @param  {String} senderAddress - the c32check address of the sender (can be left blank)
 */
export interface ReadOnlyFunctionOptions {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: (string | ClarityValue)[];
  /** address of the sender (can be left blank, will default to contract address) */
  senderAddress?: string;
  /** the network that the contract which contains the function is deployed to */
  network?: StacksNetwork;
  tip?: string;
}
