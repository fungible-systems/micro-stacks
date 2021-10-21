import {
  MicroblockListResponse,
  Microblock,
  UnanchoredTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, microblockEndpoint } from '../utils';

/**
 * Get recent microblocks
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_microblock_list
 */

export async function fetchMicroblocks({ url, limit, offset }: BaseListParams) {
  const path = generateUrl(microblockEndpoint(url), {
    limit,
    offset,
  });
  return fetchJson<MicroblockListResponse>(path);
}

/**
 * Get microblock
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_microblock_by_hash
 */

export async function fetchMicroblock({ url, hash }: BaseListParams & { hash: string }) {
  const path = generateUrl(`${microblockEndpoint(url)}/${hash}`, {});
  return fetchJson<Microblock>(path);
}

/**
 * Get the list of current transactions that belong to unanchored microblocks
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_unanchored_txs
 */

export async function fetchMicroblocksUnanchoredTransactions({ url }: BaseListParams) {
  const path = generateUrl(`${microblockEndpoint(url)}/unanchored/txs`, {});
  return fetchJson<UnanchoredTransactionListResponse>(path);
}
