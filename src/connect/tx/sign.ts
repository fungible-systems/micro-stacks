import { Json, TokenSigner } from 'micro-stacks/crypto';
import { ContractCallTxPayload, ContractDeployTxPayload, StxTransferTxPayload } from './types';
import { getOrFormatPostConditions } from './shared';

export const signTransactionPayload = async (
  payload: ContractCallTxPayload | StxTransferTxPayload | ContractDeployTxPayload,
  privateKey: string
) => {
  const signer = new TokenSigner('ES256k', privateKey);
  return signer.sign({
    ...payload,
    postConditions: getOrFormatPostConditions(payload.postConditions),
  } as unknown as Json);
};
