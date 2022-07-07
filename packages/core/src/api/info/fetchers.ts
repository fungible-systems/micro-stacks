import {
  CoreNodeInfoResponse,
  ServerStatusResponse,
  NetworkBlockTimesResponse,
  NetworkBlockTimeResponse,
  GetStxSupplyResponse,
  GetStxSupplyLegacyFormatResponse,
  CoreNodePoxResponse,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';

type WithHeight<T> = T & {
  height?: number;
};

import {
  fetchJson,
  fetchText,
  generateUrl,
  infoEndpoint,
  statusEndpoint,
  networkBlockTimesEndpoint,
  networkBlockTimeEndpoint,
  stxSupplyEndpoint,
  stxSupplyPlainEndpoint,
  stxSupplyCirculatingPlainEndpoint,
  stxSupplyLegacyFormatEndpoint,
  poxEndpoint,
} from '../utils';

/**
 * Get Core API information
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchcoreapiinfo
 */

export async function fetchCoreApiInfo({ url }: BaseListParams) {
  const path = generateUrl(infoEndpoint(url), {});
  return fetchJson<CoreNodeInfoResponse>(path);
}

/**
 * Get Blockchain API status
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchstatus
 */

export async function fetchStatus({ url }: BaseListParams) {
  const path = generateUrl(statusEndpoint(url), {});
  return fetchJson<ServerStatusResponse>(path);
}

/**
 * Get the network target block time
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchnetworkblocktimes
 */

export async function fetchNetworkBlockTimes({ url }: BaseListParams) {
  const path = generateUrl(networkBlockTimesEndpoint(url), {});
  return fetchJson<NetworkBlockTimesResponse>(path);
}

/**
 * Get a given network's target block time
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchnetworkblocktime
 */

export async function fetchNetworkBlockTime({
  url,
  network,
}: BaseListParams & { network: 'mainnet' | 'testnet' }) {
  const path = generateUrl(`${networkBlockTimeEndpoint(url)}/${network}`, {});
  return fetchJson<NetworkBlockTimeResponse>(path);
}

/**
 * Get total and unlocked STX supply
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchstxsupply
 */

export async function fetchStxSupply({ url }: WithHeight<BaseListParams>) {
  const path = generateUrl(stxSupplyEndpoint(url), {});
  return fetchJson<GetStxSupplyResponse>(path);
}

/**
 * Get total STX supply in plain text format
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchstxsupplyplain
 */

export async function fetchStxSupplyPlain({ url }: BaseListParams) {
  const path = generateUrl(stxSupplyPlainEndpoint(url), {});
  return fetchText(path);
}

/**
 * Get circulating STX supply in plain text format
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchstxsupplycirculatingplain
 */

export async function fetchStxSupplyCirculatingPlain({ url }: BaseListParams) {
  const path = generateUrl(stxSupplyCirculatingPlainEndpoint(url), {});
  return fetchText(path);
}

/**
 * Get total and unlocked STX supply (results formatted the same as the legacy 1.0 API)
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchstxsupplylegacyformat
 */

export async function fetchStxSupplyLegacyFormat({ url }: WithHeight<BaseListParams>) {
  const path = generateUrl(stxSupplyLegacyFormatEndpoint(url), {});
  return fetchJson<GetStxSupplyLegacyFormatResponse>(path);
}

/**
 * Get PoX details
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/info#fetchpox
 */

export async function fetchPox({ url }: BaseListParams) {
  const path = generateUrl(poxEndpoint(url), {});
  return fetchJson<CoreNodePoxResponse>(path);
}
