import { Json } from 'micro-stacks/crypto';
import { ContractCallTxPayload, ContractDeployTxPayload, StxTransferTxPayload } from './types';
import { getOrFormatPostConditions } from './shared';
import { createWalletJWT } from '../common/create-wallet-jwt';

export const signTransactionPayload = async (
  payload: ContractCallTxPayload | StxTransferTxPayload | ContractDeployTxPayload,
  privateKey?: string
) => {
  const tokenPayload = {
    ...payload,
    postConditions: getOrFormatPostConditions(payload.postConditions),
  } as unknown as Json;
  return createWalletJWT(tokenPayload, privateKey);
};
