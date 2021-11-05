import { ClarityValue } from 'micro-stacks/clarity';

export interface CallReadOnlyFunctionRequest {
  contractAddress: string;
  contractName: string;
  functionName: string;
  functionArgs: (string | ClarityValue)[];
  sender?: string;
  tip?: string;
}
