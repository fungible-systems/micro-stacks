import { AccountBase, AccountListOptions, WithHeight } from './types';
import {
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  AddressAssetsListResponse,
  MempoolTransactionListResponse,
  MempoolTransaction,
} from '@stacks/stacks-blockchain-api-types';
import { addressEndpoint, fetchJson, generateUrl, txMempoolEndpoint, txEndpoint } from '../utils';

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_account_balance
export async function fetchAccountBalances({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/balances`;
  return fetchJson<AddressBalanceResponse>(path);
}

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_account_stx_balance
export async function fetchAccountStxBalance({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/stx`;
  return fetchJson<AddressStxBalanceResponse>(path);
}

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_account_transactions
export async function fetchAccountTransactions({
  url,
  principal,
  limit,
  offset = 0,
  height,
}: WithHeight<AccountListOptions>) {
  const basePath = `${addressEndpoint(url)}/${principal}/transactions`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    height,
  });
  return fetchJson<AddressTransactionsListResponse>(path);
}

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_account_transactions_with_transfers
export async function fetchAccountTransactionsWithTransfers({
  url,
  principal,
  limit,
  offset = 0,
  height,
}: WithHeight<AccountListOptions>) {
  const basePath = `${addressEndpoint(url)}/${principal}/transactions_with_transfers`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    height,
  });
  return fetchJson<AddressTransactionsWithTransfersListResponse>(path);
}

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_account_assets
export async function fetchAccountAssets({
  url,
  principal,
  limit,
  offset = 0,
}: AccountListOptions) {
  const basePath = `${addressEndpoint(url)}/${principal}/assets`;
  const path = generateUrl(basePath, {
    limit,
    offset,
  });
  return fetchJson<AddressAssetsListResponse>(path);
}

// @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_mempool_transaction_list
export async function fetchAccountMempoolTransactions({
  url,
  principal,
  limit,
  offset = 0,
}: AccountListOptions) {
  const basePath = `${txMempoolEndpoint(url)}`;
  const isContract = principal?.includes('.');
  if (!isContract) {
    const path = generateUrl(basePath, {
      limit,
      offset,
      address: principal,
    });
    return fetchJson<MempoolTransactionListResponse>(path);
  } else {
    const path = generateUrl(basePath, {
      limit,
      offset,
    });
    const data = await fetchJson<MempoolTransactionListResponse>(path);
    const results = await Promise.all(
      data.results
        .filter(tx => JSON.stringify(tx).includes(principal))
        .map(async tx =>
          fetchTx<MempoolTransaction>({
            url,
            txid: tx.tx_id,
          })
        )
    );

    return { ...data, results };
  }
}

async function fetchTx<T>({ url, txid }: { url: string; txid: string }) {
  return fetchJson<T>(`${txEndpoint(url)}/${txid}`);
}
