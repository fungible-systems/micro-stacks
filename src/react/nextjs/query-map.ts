import { Queries } from 'jotai-query-toolkit/nextjs';
import {
  accountAssetsQuery,
  accountBalancesQuery,
  accountPendingTransactionsQuery,
  accountTransactionsQuery,
  accountTransactionsWithTransfersQuery,
} from '../api/accounts/queries';
import { PartialStacksSession } from './types';

export type QueriesLiteral =
  | 'currentAccountTransactions'
  | 'currentAccountMempoolTransactions'
  | 'currentAccountTransactionsWithTransfers'
  | 'currentAccountBalances'
  | 'currentAccountAssetsList'
  | 'currentAccountNames';

export const queryMap: Record<
  QueriesLiteral,
  (session: PartialStacksSession, networkUrl: string) => Queries[number]
> = {
  currentAccountMempoolTransactions(session: PartialStacksSession, networkUrl: string) {
    return accountPendingTransactionsQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    });
  },
  currentAccountTransactionsWithTransfers(session: PartialStacksSession, networkUrl: string) {
    return accountTransactionsWithTransfersQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    });
  },
  currentAccountBalances(session: PartialStacksSession, networkUrl: string) {
    return accountBalancesQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    });
  },
  currentAccountAssetsList(session: PartialStacksSession, networkUrl: string) {
    return accountAssetsQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    });
  },
  currentAccountNames(session: PartialStacksSession, networkUrl: string) {
    return accountTransactionsQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    });
  },
  currentAccountTransactions: (session: PartialStacksSession, networkUrl: string) =>
    accountTransactionsQuery({
      principal: session!.addresses!.mainnet,
      networkUrl,
    }),
};
