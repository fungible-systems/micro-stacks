import type { ContractCallTxOptions, ContractCallTxPayload } from './types';
import type { ClarityValue } from 'micro-stacks/clarity';
import { cvToHex } from 'micro-stacks/clarity';
import { signTransactionPayload } from './sign';
import { TransactionTypes } from './types';
import { cleanHex } from 'micro-stacks/common';
import { safeGetPublicKey } from '../common/utils';

/**
 * makeContractCallToken
 *
 * Make a contract call transaction token for use with a wallet based authenticator
 * @param functionArgs
 * @param privateKey
 * @param options
 */
export async function makeContractCallToken({
  functionArgs,
  privateKey,
  ...options
}: ContractCallTxOptions) {
  const publicKey = safeGetPublicKey(privateKey);

  const payload: ContractCallTxPayload = {
    ...options,
    functionArgs: functionArgs.map((arg: string | ClarityValue) =>
      cleanHex(typeof arg === 'string' ? arg : cvToHex(arg))
    ),
    txType: TransactionTypes.ContractCall,
    publicKey,
  };

  return signTransactionPayload(payload, privateKey);
}
