import { ContractDeployTxOptions, ContractDeployTxPayload, TransactionTypes } from './types';
import { getPublicKey } from 'micro-stacks/crypto';
import { signTransactionPayload } from './sign';
import { bytesToHex } from 'micro-stacks/common';

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
    publicKey: bytesToHex(getPublicKey(privateKey, true)),
    txType: TransactionTypes.ContractDeploy,
  };
  return signTransactionPayload(payload, privateKey);
}
