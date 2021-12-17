import { AccountBase, AccountListOptions } from './types';
import {
  AddressBalanceResponse,
  AddressStxBalanceResponse,
  AddressTransactionsListResponse,
  AddressTransactionsWithTransfersListResponse,
  AddressAssetsListResponse,
  MempoolTransactionListResponse,
  MempoolTransaction,
  AddressTransactionWithTransfers,
  AddressNonces,
  AddressStxInboundListResponse,
  AddressNftListResponse,
  AccountDataResponse,
} from '@stacks/stacks-blockchain-api-types';
import { addressEndpoint, fetchJson, generateUrl, txMempoolEndpoint, txEndpoint } from '../utils';

type WithHeight<T> = T & {
  height?: number;
};

// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccountbalances
export async function fetchAccountBalances({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/balances`;
  return fetchJson<AddressBalanceResponse>(path);
}

// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccountstxbalance
export async function fetchAccountStxBalance({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/stx`;
  return fetchJson<AddressStxBalanceResponse>(path);
}

// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccounttransactions
export async function fetchAccountTransactions({
  url,
  principal,
  limit,
  offset = 0,
  height,
  unanchored,
}: WithHeight<AccountListOptions>) {
  const basePath = `${addressEndpoint(url)}/${principal}/transactions`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    height,
    unanchored,
  });
  return fetchJson<AddressTransactionsListResponse>(path);
}

//See https://docs.hiro.so/api#operation/get_single_transaction_with_transfers
export async function fetchAccountTransactionWithTransfers({
  url,
  principal,
  tx_id,
  limit,
  offset = 0,
  height,
  unanchored,
}: { tx_id: string } & WithHeight<AccountListOptions>) {
  const basePath = `${addressEndpoint(url)}/${principal}/${tx_id}/transactions_with_transfers`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    height,
    unanchored,
  });
  return fetchJson<AddressTransactionWithTransfers>(path);
}

// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccounttransactionswithtransfers
export async function fetchAccountTransactionsWithTransfers({
  url,
  principal,
  limit,
  offset = 0,
  height,
  unanchored,
}: WithHeight<AccountListOptions>) {
  const basePath = `${addressEndpoint(url)}/${principal}/transactions_with_transfers`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    height,
    unanchored,
  });
  return fetchJson<AddressTransactionsWithTransfersListResponse>(path);
}

// https://docs.hiro.so/api#operation/get_account_nonces
export async function fetchAccountNonces({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/nonces`;
  return fetchJson<AddressNonces>(path);
}

// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccountassets
export async function fetchAccountAssets({
  url,
  principal,
  limit,
  offset = 0,
  unanchored,
}: AccountListOptions) {
  const basePath = `${addressEndpoint(url)}/${principal}/assets`;
  const path = generateUrl(basePath, {
    limit,
    offset,
    unanchored,
  });
  return fetchJson<AddressAssetsListResponse>(path);
}

// https://docs.hiro.so/api#operation/get_account_inbound (does this replaces the fetchaccountmempooltransactions endpoint ? )
export async function fetchAccountStxInbound({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/stx_inbound`;
  return fetchJson<AddressStxInboundListResponse>(path);
}

// https://docs.hiro.so/api#operation/get_account_nft
export async function fetchAccountNftEvents({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}/nft_events`;
  return fetchJson<AddressNftListResponse>(path);
}

// https://docs.hiro.so/api#operation/get_account_info
export async function fetchAccountInfo({ url, principal }: AccountBase) {
  const path = `${addressEndpoint(url)}/${principal}`;
  return fetchJson<AccountDataResponse>(path);
}

// DEPRECATED?
// @see https://docs.micro-stacks.dev/modules/core/api/accounts#fetchaccountmempooltransactions
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
