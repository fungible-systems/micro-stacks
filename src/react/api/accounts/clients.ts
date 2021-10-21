import { atomFamilyWithInfiniteQuery, atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchAccountAssets,
  fetchAccountBalances,
  fetchAccountMempoolTransactions,
  fetchAccountStxBalance,
  fetchAccountTransactions,
  fetchAccountTransactionsWithTransfers,
} from '../../../api/accounts/fetchers';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import { getNextPageParam } from '../../../api/utils';
import { AccountClientKeys } from './keys';

import type {
  PrincipalWithNetwork,
  PrincipalListWithNetwork,
  PrincipalListHeightWithNetwork,
} from '../../../api/accounts/types';
import type {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';

export const accountBalancesClientAtom = atomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressBalanceResponse
>(AccountClientKeys.Balances, async function queryFn(get, [principal, url]) {
  return fetchAccountBalances({ url, principal });
});

export const accountStxBalanceClientAtom = atomFamilyWithQuery<
  PrincipalWithNetwork,
  AddressStxBalanceResponse
>(AccountClientKeys.StxBalance, async function queryFn(get, [principal, url]) {
  return fetchAccountStxBalance({ url, principal });
});

export const accountTransactionsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsListResponse
>(
  AccountClientKeys.Transactions,
  async function queryFn(get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactions({ principal, limit, height, url, offset });
  },
  {
    getNextPageParam,
  }
);

export const accountTransactionsListWithTransfersClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListHeightWithNetwork,
  AddressTransactionsWithTransfersListResponse
>(
  AccountClientKeys.TransactionsWithTransfers,
  async function queryFn(get, [principal, params, url], { pageParam: offset = 0 }) {
    const { limit = DEFAULT_LIST_LIMIT, height = undefined } = params;
    return fetchAccountTransactionsWithTransfers({
      principal,
      limit,
      offset,
      url,
      height,
    });
  },
  {
    getNextPageParam,
  }
);

export const accountAssetsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  AddressAssetsListResponse
>(
  AccountClientKeys.Assets,
  async function queryFn(
    get,
    [principal, limit = DEFAULT_LIST_LIMIT, url],
    { pageParam: offset = 0 }
  ) {
    return fetchAccountAssets({
      url,
      limit,
      principal,
      offset,
    });
  },
  {
    getNextPageParam,
  }
);

export const accountMempoolTransactionsListClientAtom = atomFamilyWithInfiniteQuery<
  PrincipalListWithNetwork,
  MempoolTransactionListResponse
>(
  AccountClientKeys.PendingTransactions,
  async function queryFn(
    get,
    [principal, limit = DEFAULT_LIST_LIMIT, url],
    { pageParam: offset = 0 }
  ) {
    return fetchAccountMempoolTransactions({
      limit,
      offset,
      url,
      principal,
    });
  },
  {
    getNextPageParam,
  }
);
