import { StxTransferTxOptions, StxTransferTxPayload, TransactionTypes } from './types';
import { signTransactionPayload } from './sign';
import { getPublicKey } from 'noble-secp256k1';

export async function makeStxTransferToken({ privateKey, ...options }: StxTransferTxOptions) {
  const payload: StxTransferTxPayload = {
    ...options,
    amount:
      typeof options.amount === 'bigint' ? Number(options.amount).toString(10) : options.amount,
    publicKey: getPublicKey(privateKey, true),
    txType: TransactionTypes.STXTransfer,
  };

  return signTransactionPayload(payload, privateKey);
}
