import { makeAtomFamilyWithInfiniteQuery, makeAtomFamilyWithQuery } from 'jotai-query-toolkit';
import {
  MempoolTransaction,
  MempoolTransactionListResponse,
  Transaction,
  TransactionResults,
  TransactionType,
} from '@stacks/stacks-blockchain-api-types';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import { getNextPageParam } from '../utils';
import {
  fetchDroppedMempoolTransactionsList,
  fetchMempoolTransactionsList,
  fetchRawTransaction,
  fetchTransaction,
  fetchTransactionsByBlockHash,
  fetchTransactionsByBlockHeight,
  fetchTransactionsList,
} from './fetchers';
import { TxClientKeys } from './keys';

type TransactionsListParams = [
  networkUrl: string,
  limit?: number,
  type?: TransactionType | TransactionType[]
];
export const makeTransactionsListClient = makeAtomFamilyWithInfiniteQuery<
  TransactionsListParams,
  TransactionResults
>({
  queryKey: TxClientKeys.TransactionsList,
  queryFn(get, [url, limit = DEFAULT_LIST_LIMIT, type], { pageParam: offset = 0 }) {
    return fetchTransactionsList({ limit, url, offset, type });
  },
  getNextPageParam,
});

type MempoolTransactionsListParams = [
  networkUrl: string,
  limit?: number,
  address?:
    | {
        address: string;
      }
    | { recipient_address: string }
    | { sender_address: string }
];

export const makeMempoolTransactionsListClient = makeAtomFamilyWithInfiniteQuery<
  MempoolTransactionsListParams,
  MempoolTransactionListResponse
>({
  queryKey: TxClientKeys.MempoolTransactionsList,
  queryFn(get, [url, limit = DEFAULT_LIST_LIMIT, address = {}], { pageParam: offset = 0 }) {
    if (address && Object.keys(address)?.length > 1)
      throw new Error(
        `[micro-stacks] You cannot pass more than one address param to the tx mempool endpoint, found: ${Object.keys(
          address
        ).join(', ')}`
      );
    return fetchMempoolTransactionsList({ limit, url, offset, ...address });
  },
  getNextPageParam,
});

export const makeDroppedMempoolTransactionsListClient = makeAtomFamilyWithInfiniteQuery<
  [networkUrl: string, limit: number],
  MempoolTransactionListResponse
>({
  queryKey: TxClientKeys.DroppedMempoolTransactionsList,
  queryFn(get, [url, limit = DEFAULT_LIST_LIMIT], { pageParam: offset = 0 }) {
    return fetchDroppedMempoolTransactionsList({ limit, url, offset });
  },
  getNextPageParam,
});

export const makeTransactionClient = makeAtomFamilyWithQuery<
  [networkUrl: string, txid: string],
  Transaction | MempoolTransaction
>({
  queryKey: TxClientKeys.Transaction,
  queryFn(get, [url, txid]) {
    return fetchTransaction({ txid, url });
  },
});

export const makeRawTransactionClient = makeAtomFamilyWithQuery<
  [networkUrl: string, txid: string],
  string
>({
  queryKey: TxClientKeys.TransactionRaw,
  queryFn(get, [url, txid]) {
    return fetchRawTransaction({ txid, url });
  },
});

export const makeTransactionsListByBlockHashClient = makeAtomFamilyWithInfiniteQuery<
  [networkUrl: string, block_hash: string, limit: number],
  TransactionResults
>({
  queryKey: TxClientKeys.TransactionsListByBlockHash,
  queryFn(get, [url, block_hash, limit = DEFAULT_LIST_LIMIT], { pageParam: offset = 0 }) {
    return fetchTransactionsByBlockHash({ block_hash, limit, url, offset });
  },
  getNextPageParam,
});

export const makeTransactionsListByBlockHeightClient = makeAtomFamilyWithInfiniteQuery<
  [networkUrl: string, block_height: number, limit: number],
  TransactionResults
>({
  queryKey: TxClientKeys.TransactionsListByBlockHeight,
  queryFn(get, [url, block_height, limit = DEFAULT_LIST_LIMIT], { pageParam: offset = 0 }) {
    return fetchTransactionsByBlockHeight({ block_height, limit, url, offset });
  },
  getNextPageParam,
});
