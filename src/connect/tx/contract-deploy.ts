import { ContractDeployTxOptions, ContractDeployTxPayload, TransactionTypes } from './types';
import { signTransactionPayload } from './sign';
import { safeGetPublicKey } from '../common/utils';

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
  return signTransactionPayload(payload, privateKey);
}
