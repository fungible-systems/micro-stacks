import { StxTransferTxOptions, StxTransferTxPayload, TransactionTypes } from './types';
import { signTransactionPayload } from './sign';
import { safeGetPublicKey } from '../common/utils';

export async function makeStxTransferToken({ privateKey, ...options }: StxTransferTxOptions) {
  const payload: StxTransferTxPayload = {
    ...options,
    amount:
      typeof options.amount === 'bigint' ? Number(options.amount).toString(10) : options.amount,
    publicKey: safeGetPublicKey(privateKey),
    txType: TransactionTypes.STXTransfer,
  };

  return signTransactionPayload(payload, privateKey);
}
