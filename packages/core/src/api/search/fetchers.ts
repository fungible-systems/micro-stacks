import { SearchErrorResult, SearchSuccessResult } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, searchEndpoint } from '../utils';

/**
 * Search blocks, transactions, contracts, or accounts by hash/ID
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/search#fetchsearch
 */

export async function fetchSearch({ url, id }: BaseListParams & { id: string }) {
  const path = generateUrl(`${searchEndpoint(url)}/` + id, {});
  return fetchJson<SearchErrorResult | SearchSuccessResult>(path);
}
