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
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnamespaceprice
 */

export async function fetchNamespacePrice({ url, tld }: BaseListParams & { tld: string }) {
  const path = generateUrl(`${v2Endpoint(url)}/prices/namespaces/${tld}`, {});
  return fetchJson<BnsGetNamespacePriceResponse>(path);
}

/**
 * Get the price of a name. The amount given will be in the smallest possible units of the currency.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnameprice
 */

export async function fetchNamePrice({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v2Endpoint(url)}/prices/names/${name}`, {});
  return fetchJson<BnsGetNamePriceResponse>(path);
}

/**
 * Fetch a list of all namespaces known to the node.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnamespaces
 */

export async function fetchNamespaces({ url }: BaseListParams) {
  const path = generateUrl(`${v1Endpoint(url)}/namespaces`, {});
  return fetchJson<BnsGetAllNamespacesResponse>(path);
}

/**
 * Fetch a list of names from the namespace.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnamesfromnamespaces
 */

export async function fetchNamesFromNamespaces({ url, tld }: BaseListParams & { tld: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/namespaces/${tld}/names`, {});
  // TODO: validate? string^([a-z0-9-_.+]{3,37})$
  return fetchJson<string[]>(path);
}

/**
 * Fetch a list of all names known to the node.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnames
 */

export async function fetchNames({ url, page }: BaseListParams & { page: number }) {
  const path = generateUrl(`${v1Endpoint(url)}/names?page=${page}`, {});
  // TODO: validate? string^([a-z0-9-_.+]{3,37})$
  return fetchJson<string[]>(path);
}

/**
 * Get Name Details
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchname
 */

export async function fetchName({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}`, {});
  return fetchJson<BnsGetNameInfoResponse>(path);
}

/**
 * Get a history of all blockchain records of a registered name.
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnamehistory
 */

export async function fetchNameHistory({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}/history`, {});
  return fetchJson<BnsFetchHistoricalZoneFileResponse>(path);
}

/**
 * Fetch Zone File
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchzonefile
 */

export async function fetchZoneFile({ url, name }: BaseListParams & { name: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/names/${name}/zonefile`, {});
  return fetchJson<BnsError | BnsFetchFileZoneResponse>(path);
}

/**
 * Get Historical Zone File
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchhistoricalzonefile
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
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchnamesbyaddress
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
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchallsubdomains
 */

export async function fetchAllSubdomains({ url, page }: BaseListParams & { page: number }) {
  const path = generateUrl(`${v1Endpoint(url)}/subdomains/`, { page: page });
  return fetchJson<BnsError | string[]>(path);
}

/**
 * Get Subdomain at Transaction
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/bns#fetchsubdomainattransaction
 */

export async function fetchSubdomainAtTransaction({
  url,
  txid,
}: BaseListParams & { txid: string }) {
  const path = generateUrl(`${v1Endpoint(url)}/subdomains/${txid}`, {});
  return fetchJson<BnsError | BnsGetSubdomainAtTx>(path);
}
