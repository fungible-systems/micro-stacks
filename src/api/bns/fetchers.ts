import {
  BnsGetNamespacePriceResponse,
  BnsGetNamePriceResponse,
  BnsGetAllNamespacesResponse,
  BnsGetNameInfoResponse,
  BnsError,
  BnsFetchHistoricalZoneFileResponse,
  BnsFetchFileZoneResponse,
  BnsNamesOwnByAddressResponse,
  BnsGetSubdomainAtTx,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, v1Endpoint, v2Endpoint } from '../utils';

/**
 * Get the price of a namespace. The amount given will be in the smallest possible units of the currency.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_namespace_price
 */

export async function fetchNamespacePrice({ url, tld }: BaseListParams & { tld: string }) {
  const path = generateUrl(`${v2Endpoint(url)}/prices/namespaces/${tld}`, {});
  return fetchJson<BnsGetNamespacePriceResponse>(path);
}

/**
 * Get the price of a name. The amount given will be in the smallest possible units of the currency.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_name_price
 */

export async function fetchNamePrice({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v2Endpoint(url)}/prices/names/${name}`, {});
  return fetchJson<BnsGetNamePriceResponse>(path);
}

/**
 * Fetch a list of all namespaces known to the node.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_all_namespaces
 */

export async function fetchNamespaces({ url }: BaseListParams) {
  const path = generateUrl(`${v1Endpoint(url)}/namespaces`, {});
  return fetchJson<BnsGetAllNamespacesResponse>(path);
}

/**
 * Fetch a list of names from the namespace.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_namespace_names
 */

export async function fetchNamesFromNamespaces({ url, tld }: BaseListParams & { tld: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/namespaces/${tld}/names`, {});
  // TODO: validate? string^([a-z0-9-_.+]{3,37})$
  return fetchJson<string[]>(path);
}

/**
 * Fetch a list of all names known to the node.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_all_names
 */

export async function fetchNames({ url, page }: BaseListParams & { page: number }) {
  const path = generateUrl(`${v1Endpoint(url)}/names?page=${page}`, {});
  // TODO: validate? string^([a-z0-9-_.+]{3,37})$
  return fetchJson<string[]>(path);
}

/**
 * Get Name Details
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_name_info
 */

export async function fetchName({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}`, {});
  return fetchJson<BnsGetNameInfoResponse>(path);
}

/**
 * Get a history of all blockchain records of a registered name.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_name_history
 */

export async function fetchNameHistory({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}/history`, {});
  return fetchJson<BnsFetchHistoricalZoneFileResponse>(path);
}

/**
 * Fetch Zone File
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/fetch_zone_file
 */

export async function fetchZoneFile({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}/zonefile`, {});
  return fetchJson<BnsError | BnsFetchFileZoneResponse>(path);
}

/**
 * Get Historical Zone File
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_historical_zone_file
 */

export async function fetchHistoricalZoneFile({
  url,
  name,
  zoneFileHash,
}: BaseListParams & { name: string; zoneFileHash: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}/zonefile/${zoneFileHash}`, {});
  return fetchJson<BnsError | BnsFetchHistoricalZoneFileResponse>(path);
}

/**
 * Retrieves a list of names owned by the address provided.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_names_owned_by_address
 */

export async function fetchNamesByAddress({
  url,
  blockchain,
  address,
}: BaseListParams & { blockchain: string; address: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/addresses/${blockchain}/${address}`, {});
  return fetchJson<BnsError | BnsNamesOwnByAddressResponse>(path);
}

/**
 * Fetch a list of all subdomains known to the node.
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_all_subdomains
 */

export async function fetchAllSubdomains({ url, page }: BaseListParams & { page: number }) {
  const path = generateUrl(`${v1Endpoint(url)}/subdomains/`, { page: page });
  return fetchJson<BnsError | string[]>(path);
}

/**
 * Get Subdomain at Transaction
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_subdomain_at_transaction
 */

export async function fetchSubdomainAtTransaction({
  url,
  txid,
}: BaseListParams & { txid: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/subdomains/${txid}`, {});
  return fetchJson<BnsError | BnsGetSubdomainAtTx>(path);
}
