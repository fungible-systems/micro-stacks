import {
  useAccountBalancesClient,
  useAccountAssetsClient,
  useAccountStxBalanceClient,
  useAccountTransactionsWithTransfersClient,
  useAccountTransactionsClient,
  useAccountMempoolTransactionsClient,
  InfiniteOptionsLimitHeight,
  InfiniteOptionsWithLimit,
} from './use-account-clients';
import { useCurrentStxAddress } from '../use-user';
import type {
  AddressAssetsListResponse,
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  MempoolTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';
import { AtomWithQueryOptions } from 'jotai-query-toolkit';

function useAssertPrincipal(): string {
  const principal = useCurrentStxAddress();
  if (!principal)
    throw new Error('[micro-stacks] Could not find current user address, are they signed in?');
  return principal;
}

/**
 * Get the balances for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountBalances(options?: AtomWithQueryOptions<AddressBalanceResponse>) {
  const principal = useAssertPrincipal();
  return useAccountBalancesClient(principal, options);
}

/**
 * Get the STX balance for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountStxBalance(
  options?: AtomWithQueryOptions<AddressStxBalanceResponse>
) {
  const principal = useAssertPrincipal();
  return useAccountStxBalanceClient(principal, options);
}

/**
 * Get confirmed transactions for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountTransactionsList(
  options?: InfiniteOptionsLimitHeight<AddressTransactionsListResponse>
) {
  const principal = useAssertPrincipal();
  return useAccountTransactionsClient(principal, options);
}

/**
 * Get mempool transactions for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountMempoolTransactionsList(
  options?: InfiniteOptionsLimitHeight<MempoolTransactionListResponse>
) {
  const principal = useAssertPrincipal();
  return useAccountMempoolTransactionsClient(principal, options);
}

/**
 * Get confirmed transactions with all STX transfer events for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountTransactionsWithTransfers(
  options?: InfiniteOptionsLimitHeight<AddressTransactionsWithTransfersListResponse>
) {
  const principal = useAssertPrincipal();
  return useAccountTransactionsWithTransfersClient(principal, options);
}

/**
 * Get asset events for the address of the current user
 * This uses the currently selected network url
 * @param options -- pass custom options to the infinite query atom. This HAS to be wrapped in `useCallback`.
 */
export function useCurrentAccountAssetsList(
  options?: InfiniteOptionsWithLimit<AddressAssetsListResponse>
) {
  const principal = useAssertPrincipal();
  return useAccountAssetsClient(principal, options);
}
