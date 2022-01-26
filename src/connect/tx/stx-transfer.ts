import { StxTransferTxOptions, StxTransferTxPayload, TransactionTypes } from './types';
import { signTransactionPayload } from './sign';
import { getPublicKey } from 'micro-stacks/crypto';
import { bytesToHex } from 'micro-stacks/common';

export async function makeStxTransferToken({ privateKey, ...options }: StxTransferTxOptions) {
  const payload: StxTransferTxPayload = {
    ...options,
    amount:
      typeof options.amount === 'bigint' ? Number(options.amount).toString(10) : options.amount,
    publicKey: bytesToHex(getPublicKey(privateKey, true)),
    txType: TransactionTypes.STXTransfer,
  };

  return signTransactionPayload(payload, privateKey);
}
