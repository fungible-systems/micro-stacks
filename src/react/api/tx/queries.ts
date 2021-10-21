import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeTxClientKeys } from './keys';
import { TransactionType } from '@stacks/stacks-blockchain-api-types';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import {
  fetchDroppedMempoolTransactionsList,
  fetchMempoolTransactionsList,
  fetchTransaction,
  fetchTransactionsByBlockHash,
  fetchTransactionsByBlockHeight,
  fetchTransactionsList,
} from '../../../api/tx/fetchers';

export function transactionListQuery({
  networkUrl,
  limit = DEFAULT_LIST_LIMIT,
  type,
}: {
  networkUrl: string;
  limit?: number;
  type: TransactionType | TransactionType[];
}): Queries[number] {
  return [
    makeTxClientKeys.TransactionsList([networkUrl, limit, type]),
    () =>
      fetchTransactionsList({
        limit,
        type,
        offset: 0,
        url: networkUrl,
      }),
  ];
}

export function mempoolTransactionListQuery({
  networkUrl,
  limit = DEFAULT_LIST_LIMIT,
  ...address
}: {
  networkUrl: string;
  limit?: number;
  sender_address?: string;
  recipient_address?: string;
  address?: string;
}): Queries[number] {
  if (address && Object.keys(address)?.length > 1)
    throw new Error(
      `[micro-stacks] You cannot pass more than one address param to the tx mempool endpoint, found: ${Object.keys(
        address
      ).join(', ')}`
    );
  return [
    makeTxClientKeys.MempoolTransactionsList([networkUrl, limit, address]),
    () =>
      fetchMempoolTransactionsList({
        limit,
        offset: 0,
        url: networkUrl,
        ...address,
      }),
  ];
}

export function droppedMempoolTransactionListQuery({
  networkUrl,
  limit = DEFAULT_LIST_LIMIT,
}: {
  networkUrl: string;
  limit?: number;
}): Queries[number] {
  return [
    makeTxClientKeys.DroppedMempoolTransactionsList([networkUrl, limit]),
    () =>
      fetchDroppedMempoolTransactionsList({
        limit,
        offset: 0,
        url: networkUrl,
      }),
  ];
}

export function transactionQuery({
  networkUrl,
  txid,
}: {
  networkUrl: string;
  txid: string;
}): Queries[number] {
  return [
    makeTxClientKeys.Transaction([networkUrl, txid]),
    () =>
      fetchTransaction({
        txid,
        url: networkUrl,
      }),
  ];
}

export function transactionListByBlockHashQuery({
  networkUrl,
  block_hash,
  limit = DEFAULT_LIST_LIMIT,
}: {
  networkUrl: string;
  block_hash: string;
  limit?: number;
}): Queries[number] {
  return [
    makeTxClientKeys.TransactionsListByBlockHash([networkUrl, block_hash, limit]),
    () =>
      fetchTransactionsByBlockHash({
        block_hash,
        limit,
        offset: 0,
        url: networkUrl,
      }),
  ];
}

export function transactionListByBlockHeightQuery({
  networkUrl,
  block_height,
  limit = DEFAULT_LIST_LIMIT,
}: {
  networkUrl: string;
  block_height: number;
  limit?: number;
}): Queries[number] {
  return [
    makeTxClientKeys.TransactionsListByBlockHeight([networkUrl, block_height, limit]),
    () =>
      fetchTransactionsByBlockHeight({
        block_height,
        limit,
        offset: 0,
        url: networkUrl,
      }),
  ];
}
