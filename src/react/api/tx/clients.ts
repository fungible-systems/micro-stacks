import { atomFamilyWithInfiniteQuery, atomFamilyWithQuery } from 'jotai-query-toolkit';
import {
  MempoolTransaction,
  MempoolTransactionListResponse,
  Transaction,
  TransactionResults,
  TransactionType,
} from '@stacks/stacks-blockchain-api-types';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import { getNextPageParam } from '../../../api/utils';
import {
  fetchDroppedMempoolTransactionsList,
  fetchMempoolTransactionsList,
  fetchRawTransaction,
  fetchTransaction,
  fetchTransactionsByBlockHash,
  fetchTransactionsByBlockHeight,
  fetchTransactionsList,
} from '../../../api/tx/fetchers';
import { TxClientKeys } from './keys';

type TransactionsListParams = [
  networkUrl: string,
  limit?: number,
  type?: TransactionType | TransactionType[]
];
export const transactionsListClient = atomFamilyWithInfiniteQuery<
  TransactionsListParams,
  TransactionResults
>(
  TxClientKeys.TransactionsList,
  async function queryFn(get, [url, limit = DEFAULT_LIST_LIMIT, type], { pageParam: offset = 0 }) {
    return fetchTransactionsList({ limit, url, offset, type });
  },
  {
    getNextPageParam,
  }
);

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

export const mempoolTransactionsListClient = atomFamilyWithInfiniteQuery<
  MempoolTransactionsListParams,
  MempoolTransactionListResponse
>(
  TxClientKeys.MempoolTransactionsList,
  async function queryFn(
    get,
    [url, limit = DEFAULT_LIST_LIMIT, address = {}],
    { pageParam: offset = 0 }
  ) {
    if (address && Object.keys(address)?.length > 1)
      throw new Error(
        `[micro-stacks] You cannot pass more than one address param to the tx mempool endpoint, found: ${Object.keys(
          address
        ).join(', ')}`
      );
    return fetchMempoolTransactionsList({ limit, url, offset, ...address });
  },
  {
    getNextPageParam,
  }
);

export const droppedMempoolTransactionsListClient = atomFamilyWithInfiniteQuery<
  [networkUrl: string, limit: number],
  MempoolTransactionListResponse
>(
  TxClientKeys.DroppedMempoolTransactionsList,
  async function queryFn(get, [url, limit = DEFAULT_LIST_LIMIT], { pageParam: offset = 0 }) {
    return fetchDroppedMempoolTransactionsList({ limit, url, offset });
  },
  {
    getNextPageParam,
  }
);

export const transactionClient = atomFamilyWithQuery<
  [networkUrl: string, txid: string],
  Transaction | MempoolTransaction
>(TxClientKeys.Transaction, async function queryFn(get, [url, txid]) {
  return fetchTransaction({ txid, url });
});

export const rawTransactionClient = atomFamilyWithQuery<[networkUrl: string, txid: string], string>(
  TxClientKeys.TransactionRaw,
  async function queryFn(get, [url, txid]) {
    return fetchRawTransaction({ txid, url });
  }
);

export const transactionsListByBlockHashClient = atomFamilyWithInfiniteQuery<
  [networkUrl: string, block_hash: string, limit: number],
  TransactionResults
>(
  TxClientKeys.TransactionsListByBlockHash,
  async function queryFn(
    get,
    [url, block_hash, limit = DEFAULT_LIST_LIMIT],
    { pageParam: offset = 0 }
  ) {
    return fetchTransactionsByBlockHash({ block_hash, limit, url, offset });
  },
  {
    getNextPageParam,
  }
);

export const transactionsListByBlockHeightClient = atomFamilyWithInfiniteQuery<
  [networkUrl: string, block_height: number, limit: number],
  TransactionResults
>(
  TxClientKeys.TransactionsListByBlockHeight,
  async function queryFn(
    get,
    [url, block_height, limit = DEFAULT_LIST_LIMIT],
    { pageParam: offset = 0 }
  ) {
    return fetchTransactionsByBlockHeight({ block_height, limit, url, offset });
  },
  {
    getNextPageParam,
  }
);
