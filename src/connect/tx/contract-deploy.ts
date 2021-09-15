import { ContractDeployTxOptions, ContractDeployTxPayload, TransactionTypes } from './types';
import { getPublicKey } from 'noble-secp256k1';
import { signTransactionPayload } from './sign';

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
    publicKey: getPublicKey(privateKey, true),
    txType: TransactionTypes.ContractDeploy,
  };
  return signTransactionPayload(payload, privateKey);
}
