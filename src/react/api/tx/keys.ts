import { makeQueryKey } from 'jotai-query-toolkit';

export enum TxClientKeys {
  TransactionsList = 'tx/TransactionsList',
  MempoolTransactionsList = 'tx/MempoolTransactionsList',
  DroppedMempoolTransactionsList = 'tx/DroppedMempoolTransactionsList',
  Transaction = 'tx/Transaction',
  TransactionRaw = 'tx/TransactionRaw',
  TransactionsListByBlockHash = 'tx/TransactionsListByBlockHash',
  TransactionsListByBlockHeight = 'tx/TransactionsListByBlockHeight',
}

export const makeTxClientKeys = {
  TransactionsList: (params: any) => makeQueryKey(TxClientKeys.TransactionsList, params),
  MempoolTransactionsList: (params: any) =>
    makeQueryKey(TxClientKeys.MempoolTransactionsList, params),
  DroppedMempoolTransactionsList: (params: any) =>
    makeQueryKey(TxClientKeys.DroppedMempoolTransactionsList, params),
  Transaction: (params: any) => makeQueryKey(TxClientKeys.Transaction, params),
  TransactionRaw: (params: any) => makeQueryKey(TxClientKeys.TransactionRaw, params),
  TransactionsListByBlockHash: (params: any) =>
    makeQueryKey(TxClientKeys.TransactionsListByBlockHash, params),
  TransactionsListByBlockHeight: (params: any) =>
    makeQueryKey(TxClientKeys.TransactionsListByBlockHeight, params),
};
