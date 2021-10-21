import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeAccountClientKeys } from './keys';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import {
  fetchAccountAssets,
  fetchAccountBalances,
  fetchAccountMempoolTransactions,
  fetchAccountStxBalance,
  fetchAccountTransactions,
  fetchAccountTransactionsWithTransfers,
} from 'micro-stacks/api';

export interface AccountQueryParams {
  principal: string;
  networkUrl: string;
}

export interface PrincipalWithOptionalLimit extends AccountQueryParams {
  limit?: number;
}

export interface PrincipalWithOptionalLimitHeight extends PrincipalWithOptionalLimit {
  height?: number;
}

export function accountBalancesQuery(params: AccountQueryParams): Queries[number] {
  const { principal, networkUrl } = params;
  return [
    makeAccountClientKeys.balances([principal, networkUrl]),
    () =>
      fetchAccountBalances({
        url: networkUrl,
        principal,
      }),
  ];
}

export function accountStxBalanceQuery(params: AccountQueryParams): Queries[number] {
  const { principal, networkUrl } = params;
  return [
    makeAccountClientKeys.stxBalance([principal, networkUrl]),
    () =>
      fetchAccountStxBalance({
        url: networkUrl,
        principal,
      }),
  ];
}

export function accountTransactionsQuery(
  params: PrincipalWithOptionalLimitHeight
): Queries[number] {
  const { principal, limit = DEFAULT_LIST_LIMIT, height = undefined, networkUrl } = params;
  return [
    makeAccountClientKeys.transactions([principal, { limit, height }, networkUrl]),
    () =>
      fetchAccountTransactions({
        url: networkUrl,
        principal,
        limit,
        height,
      }),
  ];
}

export function accountPendingTransactionsQuery(
  params: PrincipalWithOptionalLimit
): Queries[number] {
  const { principal, limit = DEFAULT_LIST_LIMIT, networkUrl } = params;
  return [
    makeAccountClientKeys.pendingTransactions([principal, limit, networkUrl]),
    () =>
      fetchAccountMempoolTransactions({
        url: networkUrl,
        principal,
        limit,
      }),
  ];
}

export function accountTransactionsWithTransfersQuery(
  params: PrincipalWithOptionalLimitHeight
): Queries[number] {
  const { principal, limit = DEFAULT_LIST_LIMIT, height = undefined, networkUrl } = params;
  return [
    makeAccountClientKeys.transactionsWithTransfers([principal, { limit, height }, networkUrl]),
    () =>
      fetchAccountTransactionsWithTransfers({
        url: networkUrl,
        principal,
        limit,
        height,
      }),
  ];
}

export function accountAssetsQuery(params: PrincipalWithOptionalLimit): Queries[number] {
  const { principal, limit = DEFAULT_LIST_LIMIT, networkUrl } = params;
  return [
    makeAccountClientKeys.assets([principal, limit, networkUrl]),
    () =>
      fetchAccountAssets({
        url: networkUrl,
        principal,
        limit,
      }),
  ];
}
