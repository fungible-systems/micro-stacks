import {
  MempoolTransaction,
  MempoolTransactionListResponse,
  Transaction,
  TransactionResults,
  TransactionType,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams, EventListParams } from '../types';
import { fetchJson, generateUrl, txEndpoint, txMempoolEndpoint, validateTxTypes } from '../utils';

/**
 * Get transactions list
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchtransactionslist
 */

export async function fetchTransactionsList({
  limit,
  offset,
  type,
  url,
}: BaseListParams & { type?: TransactionType | TransactionType[] }) {
  const path = generateUrl(txEndpoint(url), {
    limit,
    offset,
    type: type ? (validateTxTypes(type) as any) : undefined,
  });
  return fetchJson<TransactionResults>(path);
}

/**
 * Get mempool transactions list
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchmempooltransactionslist
 */

export async function fetchMempoolTransactionsList({
  limit,
  offset,
  sender_address,
  recipient_address,
  address,
  url,
}: BaseListParams & { sender_address?: string; recipient_address?: string; address?: string }) {
  const path = generateUrl(txMempoolEndpoint(url), {
    limit,
    offset,
    sender_address,
    recipient_address,
    address,
  });
  return fetchJson<MempoolTransactionListResponse>(path);
}

/**
 * Get dropped mempool transactions list
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchdroppedmempooltransactionslist
 */

export async function fetchDroppedMempoolTransactionsList({ limit, offset, url }: BaseListParams) {
  const path = generateUrl(txMempoolEndpoint(url), {
    limit,
    offset,
  });
  return fetchJson<MempoolTransactionListResponse>(path);
}

/**
 * Get transaction by txid
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchtransaction
 */
export async function fetchTransaction({
  txid,
  event_offset,
  event_limit,
  url,
}: EventListParams & { txid: string }) {
  const path = generateUrl(`${txEndpoint(url)}/${txid}`, {
    event_offset,
    event_limit,
  });
  return fetchJson<Transaction | MempoolTransaction>(path);
}

/**
 * Get raw transaction by id
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchrawtransaction
 */
export async function fetchRawTransaction({ txid, url }: { txid: string; url: string }) {
  const path = `${txEndpoint(url)}/${txid}/raw`;
  return fetchJson<string>(path);
}

/**
 * Get transactions in a block by hash
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchtransactionsbyblockhash
 */
export async function fetchTransactionsByBlockHash({
  block_hash,
  url,
  limit,
  offset,
}: BaseListParams & {
  block_hash: string;
}) {
  const path = `${txEndpoint(url)}/block/${block_hash}`;
  return fetchJson<TransactionResults>(generateUrl(path, { limit, offset }));
}

/**
 * Get transactions in a block by height
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/transactions#fetchtransactionsbyblockheight
 */
export async function fetchTransactionsByBlockHeight({
  block_height,
  url,
  limit,
  offset,
}: BaseListParams & {
  block_height: number;
}) {
  const path = `${txEndpoint(url)}/block_height/${block_height.toString(10)}`;
  return fetchJson<TransactionResults>(generateUrl(path, { limit, offset }));
}
