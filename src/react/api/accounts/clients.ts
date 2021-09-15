import { makeAtomFamilyWithQuery, makeAtomFamilyWithInfiniteQuery } from 'jotai-query-toolkit';

import {
  fetchAccountAssets,
  fetchAccountBalances,
  fetchAccountMempoolTransactions,
  fetchAccountStxBalance,
  fetchAccountTransactions,
  fetchAccountTransactionsWithTransfers,
} from './fetchers';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import { getNextPageParam } from '../utils';
import { AccountClientKeys } from './keys';

import type {
  PrincipalWithNetwork,
  PrincipalListWithNetwork,
  PrincipalListHeightWithNetwork,
} from './types';
import type {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';

export const makeAccountBalancesClientAtom = makeAtomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressBalanceResponse
>({
  queryKey: AccountClientKeys.Balances,
  queryFn(get, [principal, url]) {
    return fetchAccountBalances({ url, principal });
  },
});
export const makeAccountStxBalanceClientAtom = makeAtomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressStxBalanceResponse
>({
  queryKey: AccountClientKeys.StxBalance,
  queryFn(get, [principal, url]) {
    return fetchAccountStxBalance({ url, principal });
  },
});

export const makeAccountTransactionsListClientAtom = makeAtomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsListResponse
>({
  queryKey: AccountClientKeys.Transactions,
  queryFn(get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactions({ principal, limit, height, url, offset });
  },
  getNextPageParam,
});

export const makeAccountTransactionsListWithTransfersClientAtom = makeAtomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsWithTransfersListResponse
>({
  queryKey: AccountClientKeys.TransactionsWithTransfers,
  queryFn(get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactionsWithTransfers({
      principal,
      limit,
      offset,
      url,
      height,
    });
  },
  getNextPageParam,
});

export const makeAccountAssetsListClientAtom = makeAtomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  AddressAssetsListResponse
>({
  queryKey: AccountClientKeys.Assets,
  queryFn(get, [principal, limit = DEFAULT_LIST_LIMIT, url], { pageParam: offset = 0 }) {
    return fetchAccountAssets({
      url,
      limit,
      principal,
      offset,
    });
  },
  getNextPageParam,
});

export const makeAccountMempoolTransactionsListClientAtom = makeAtomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  MempoolTransactionListResponse
>({
  queryKey: AccountClientKeys.PendingTransactions,
  queryFn(get, [principal, limit = DEFAULT_LIST_LIMIT, url], { pageParam: offset = 0 }) {
    return fetchAccountMempoolTransactions({
      limit,
      offset,
      url,
      principal,
    });
  },
  getNextPageParam,
});
