import { makeQueryKey } from 'jotai-query-toolkit';
import {
  PrincipalListHeightWithNetwork,
  PrincipalListWithNetwork,
  PrincipalWithNetwork,
} from 'micro-stacks/api';

export enum AccountClientKeys {
  Balances = 'accounts/Balances',
  StxBalance = 'accounts/StxBalances',
  Transactions = 'accounts/Transactions',
  PendingTransactions = 'accounts/PendingTransactions',
  TransactionsWithTransfers = 'accounts/TransactionsWithTransfers',
  Assets = 'accounts/Assets',
}

export const makeAccountClientKeys = {
  balances: (params: PrincipalWithNetwork) => makeQueryKey(AccountClientKeys.Balances, params),
  stxBalance: (params: PrincipalWithNetwork) => makeQueryKey(AccountClientKeys.StxBalance, params),
  transactions: (params: PrincipalListHeightWithNetwork) =>
    makeQueryKey(AccountClientKeys.Transactions, params),
  pendingTransactions: (params: PrincipalListWithNetwork) =>
    makeQueryKey(AccountClientKeys.PendingTransactions, params),
  transactionsWithTransfers: (params: PrincipalListHeightWithNetwork) =>
    makeQueryKey(AccountClientKeys.TransactionsWithTransfers, params),
  assets: (params: PrincipalListWithNetwork) => makeQueryKey(AccountClientKeys.Assets, params),
};
