import {
  AtomWithQueryOptions,
  AtomWithInfiniteQueryOptions,
  useInfiniteQueryAtom,
  useQueryAtom,
} from 'jotai-query-toolkit';
import type {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';
import { useCurrentNetworkUrl } from '../use-network';
import { DEFAULT_LIST_LIMIT } from '../../constants';
import {
  makeAccountAssetsListClientAtom,
  makeAccountBalancesClientAtom,
  makeAccountMempoolTransactionsListClientAtom,
  makeAccountStxBalanceClientAtom,
  makeAccountTransactionsListClientAtom,
  makeAccountTransactionsListWithTransfersClientAtom,
} from '../../api/accounts/clients';
import type { WithHeight } from '../../types';
import type { WithLimit } from '../../types';

export type InfiniteOptionsWithLimit<T> = WithLimit<AtomWithInfiniteQueryOptions<T>>;
export type InfiniteOptionsLimitHeight<T> = WithHeight<WithLimit<AtomWithInfiniteQueryOptions<T>>>;

const DEFAULT_LIMIT_OPTS = {
  limit: DEFAULT_LIST_LIMIT,
};

const DEFAULT_LIMIT_HEIGHT_OPTS = {
  limit: DEFAULT_LIST_LIMIT,
  height: undefined,
};

/**
 * Get the balances for a given principal (standard or contract principal)
 * This uses the currently selected network url
 * @param principal - the principal you're interested in
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountBalancesClient(
  principal: string,
  options: AtomWithQueryOptions<AddressBalanceResponse> = {}
) {
  const networkUrl = useCurrentNetworkUrl();
  return useQueryAtom(makeAccountBalancesClientAtom(options)([principal, networkUrl]));
}

/**
 * Get the STX balance for a given principal (standard or contract principal)
 * This uses the currently selected network url
 * @param principal - the principal you're interested in
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountStxBalanceClient(
  principal: string,
  options: AtomWithQueryOptions<AddressStxBalanceResponse> = {}
) {
  const networkUrl = useCurrentNetworkUrl();
  return useQueryAtom(makeAccountStxBalanceClientAtom(options)([principal, networkUrl]));
}

/**
 * Get transactions for a given principal (standard or contract principal)
 * This uses the currently selected network url
 * @param principal - the principal you're interested in
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountTransactionsClient(
  principal: string,
  options: InfiniteOptionsLimitHeight<AddressTransactionsListResponse> = DEFAULT_LIMIT_HEIGHT_OPTS
) {
  const networkUrl = useCurrentNetworkUrl();
  const { limit, height, ...opts } = options;
  return useInfiniteQueryAtom<AddressTransactionsListResponse | undefined>(
    makeAccountTransactionsListClientAtom(opts)([
      principal,
      {
        limit: limit || DEFAULT_LIST_LIMIT,
        height,
      },
      networkUrl,
    ]) as any
    // TODO: fix types
  );
}

/**
 * Get pending transactions for a given principal (standard or contract principal)
 * This uses the currently selected network url
 * @param principal - the principal you're interested in
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountMempoolTransactionsClient(
  principal: string,
  options: InfiniteOptionsWithLimit<MempoolTransactionListResponse> = DEFAULT_LIMIT_OPTS
) {
  const networkUrl = useCurrentNetworkUrl();
  const { limit, ...opts } = options;
  return useInfiniteQueryAtom<MempoolTransactionListResponse | undefined>(
    makeAccountMempoolTransactionsListClientAtom(opts)([
      principal,
      limit || DEFAULT_LIST_LIMIT,
      networkUrl,
    ]) as any
    // TODO: fix types
  );
}

/**
 * Get the transactions with additional STX transfer events for a given STANDARD principal (contract principals are not currently supported)
 * This uses the currently selected network url
 * @param principal - the principal you're interested in (NOT contract principal)
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountTransactionsWithTransfersClient(
  principal: string,
  options: InfiniteOptionsLimitHeight<AddressTransactionsWithTransfersListResponse> = DEFAULT_LIMIT_HEIGHT_OPTS
) {
  if (principal.includes('.'))
    throw Error(
      'useAccountTransactionsWithTransfersClient does not currently support contract principals'
    );
  const networkUrl = useCurrentNetworkUrl();
  const { limit = DEFAULT_LIST_LIMIT, height, ...opts } = options;
  return useInfiniteQueryAtom(
    makeAccountTransactionsListWithTransfersClientAtom(opts)([
      principal,
      {
        limit,
        height,
      },
      networkUrl,
    ]) as any // TODO: fix types
  );
}

/**
 * Get the asset events with for a given principal
 * This uses the currently selected network url
 * @param principal - the principal you're interested in
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useAccountAssetsClient(
  principal: string,
  options: InfiniteOptionsWithLimit<AddressAssetsListResponse> = DEFAULT_LIMIT_OPTS
) {
  const networkUrl = useCurrentNetworkUrl();
  const { limit = DEFAULT_LIST_LIMIT, ...opts } = options;
  return useInfiniteQueryAtom(
    makeAccountAssetsListClientAtom(opts)([principal, limit, networkUrl]) as any // TODO: fix types
  );
}
