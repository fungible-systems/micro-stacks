import { ClarityValue } from 'micro-stacks/clarity';
import { StacksNetwork } from 'micro-stacks/network';

export interface BaseListParams {
  limit?: number;
  offset?: number;
  url: string;
}

export interface EventListParams {
  event_limit?: number;
  event_offset?: number;
  url: string;
}

export interface FetchFeeRateParams {
  transaction: string;
}

export interface FetchTokensParams {
  address: string;
  stacking?: boolean;
}

// TODO: this is a duplication (with the addition of tip) of ReadOnlyFunctionOptions in src/transactions/builders.ts
export interface ReadOnlyFunctionFetcherOptions {
  contractName: string;
  contractAddress: string;
  functionName: string;
  functionArgs: ClarityValue[];
  /** the network that the contract which contains the function is deployed to */
  network?: StacksNetwork;
  /** address of the sender */
  senderAddress: string;
  tip?: string;
}
