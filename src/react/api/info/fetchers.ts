import { CoreNodeInfoResponse, ServerStatusResponse } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, infoEndpoint, statusEndpoint } from '../utils';

/**
 * Get Core API information
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_core_api_info
 */

export async function fetchCoreApiInfo({ url }: BaseListParams) {
  const path = generateUrl(infoEndpoint(url), {});
  return fetchJson<CoreNodeInfoResponse>(path);
}

/**
 * Get Blockchain API status
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_status
 */

export async function fetchStatus({ url }: BaseListParams) {
  const path = generateUrl(statusEndpoint(url), {});
  return fetchJson<ServerStatusResponse>(path);
}