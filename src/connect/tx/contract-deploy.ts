import { ContractDeployTxOptions, ContractDeployTxPayload, TransactionTypes } from './types';
import { signTransactionPayload } from './sign';
import { safeGetPublicKey } from '../common/utils';
import { validateClarityAsciiValue } from 'micro-stacks/common';

/**
 * makeContractDeployToken
 *
 * Make a contract deploy transaction token for use with a wallet-based authenticator.
 * @param privateKey
 * @param options
 */
export async function makeContractDeployToken({ privateKey, ...options }: ContractDeployTxOptions) {
  const payload: ContractDeployTxPayload = {
    ...options,
    publicKey: safeGetPublicKey(privateKey),
    txType: TransactionTypes.ContractDeploy,
  };

  const contractNameValidation = validateClarityAsciiValue(options.contractName);

  if (!contractNameValidation.valid)
    throw TypeError(
      `[micro-stacks/react] Contract name failed validation. Reason: ${contractNameValidation.reason}`
    );

  return signTransactionPayload(payload, privateKey);
}
