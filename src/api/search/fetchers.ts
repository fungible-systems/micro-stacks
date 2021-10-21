import { SearchErrorResult, SearchSuccessResult } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, searchEndpoint } from '../utils';

/**
 * Search blocks, transactions, contracts, or accounts by hash/ID
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/search_by_id
 */

export async function fetchSearch({ url, id }: BaseListParams & { id: string }) {
  const path = generateUrl(`${searchEndpoint(url)}/` + id, {});
  return fetchJson<SearchErrorResult | SearchSuccessResult>(path);
}
