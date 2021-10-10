import { AssetInfo, ClarityAbi, ClarityValue, cvToHex, PrincipalCV } from 'micro-stacks/clarity';
import { StacksMainnet, StacksNetwork, StacksTestnet } from 'micro-stacks/network';

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
