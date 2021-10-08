import {
  CoreNodeInfoResponse,
  ServerStatusResponse,
  NetworkBlockTimesResponse,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import {
  fetchJson,
  generateUrl,
  infoEndpoint,
  statusEndpoint,
  networkBlockTimesEndpoint,
} from '../utils';

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

/**
 * Get the network target block time
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_network_block_times
 */

export async function fetchNetworkBlockTimes({ url }: BaseListParams) {
  const path = generateUrl(networkBlockTimesEndpoint(url), {});
  return fetchJson<NetworkBlockTimesResponse>(path);
}
