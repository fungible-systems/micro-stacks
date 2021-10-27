import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchNamespacePrice,
  fetchNamePrice,
  fetchNamespaces,
  fetchNamesFromNamespaces,
  fetchNames,
  fetchName,
  fetchNameHistory,
  fetchZoneFile,
  fetchHistoricalZoneFile,
  fetchNamesByAddress,
  fetchAllSubdomains,
  fetchSubdomainAtTransaction,
} from '../../../api/bns/fetchers';
import { BnsClientKeys } from './keys';

import type {
  NetworkWithTld,
  NetworkWithName,
  NetworkWithPage,
  NetworkWithNameZoneFileHash,
  NetworkWithBlockchainAddress,
  NetworkWithTxid,
} from '../../types';

import type {
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

export const namespacePriceClientAtom = atomFamilyWithQuery<
  NetworkWithTld,
  BnsGetNamespacePriceResponse
>(BnsClientKeys.NamespacePrice, async function queryFn(get, [url, tld]) {
  return fetchNamespacePrice({ url, tld });
});

export const namePriceClientAtom = atomFamilyWithQuery<NetworkWithName, BnsGetNamePriceResponse>(
  BnsClientKeys.NamespacePrice,
  async function queryFn(get, [url, name]) {
    return fetchNamePrice({ url, name });
  }
);

export const namespacesClientAtom = atomFamilyWithQuery<
  [networkUrl: string],
  BnsGetAllNamespacesResponse
>(BnsClientKeys.Namespaces, async function queryFn(get, [url]) {
  return fetchNamespaces({ url });
});

export const namesFromNamespacesClientAtom = atomFamilyWithQuery<NetworkWithTld, string[]>(
  BnsClientKeys.NamesFromNamespaces,
  async function queryFn(get, [url, tld]) {
    return fetchNamesFromNamespaces({ url, tld });
  }
);

export const namesClientAtom = atomFamilyWithQuery<NetworkWithPage, string[]>(
  BnsClientKeys.Names,
  async function queryFn(get, [url, page]) {
    return fetchNames({ url, page });
  }
);

export const nameClientAtom = atomFamilyWithQuery<NetworkWithName, BnsGetNameInfoResponse>(
  BnsClientKeys.Name,
  async function queryFn(get, [url, name]) {
    return fetchName({ url, name });
  }
);

export const nameHistoryClientAtom = atomFamilyWithQuery<
  NetworkWithName,
  BnsFetchHistoricalZoneFileResponse
>(BnsClientKeys.NameHistory, async function queryFn(get, [url, name]) {
  return fetchNameHistory({ url, name });
});

export const zoneFileClientAtom = atomFamilyWithQuery<NetworkWithName, BnsFetchFileZoneResponse>(
  BnsClientKeys.ZoneFile,
  async function queryFn(get, [url, name]) {
    return fetchZoneFile({ url, name });
  }
);

export const historicalZoneFileClientAtom = atomFamilyWithQuery<
  NetworkWithNameZoneFileHash,
  BnsError | BnsFetchHistoricalZoneFileResponse
>(BnsClientKeys.HistoricalZoneFile, async function queryFn(get, [url, name, zoneFileHash]) {
  return fetchHistoricalZoneFile({ url, name, zoneFileHash });
});

export const namesByAddressClientAtom = atomFamilyWithQuery<
  NetworkWithBlockchainAddress,
  BnsError | BnsNamesOwnByAddressResponse
>(BnsClientKeys.NamesByAddress, async function queryFn(get, [url, blockchain, address]) {
  return fetchNamesByAddress({ url, blockchain, address });
});

export const allSubdomainsClientAtom = atomFamilyWithQuery<NetworkWithPage, BnsError | string[]>(
  BnsClientKeys.AllSubdomains,
  async function queryFn(get, [url, page]) {
    return fetchAllSubdomains({ url, page });
  }
);

export const subdomainAtTransactionClientAtom = atomFamilyWithQuery<
  NetworkWithTxid,
  BnsError | BnsGetSubdomainAtTx
>(BnsClientKeys.SubdomainAtTransaction, async function queryFn(get, [url, txid]) {
  return fetchSubdomainAtTransaction({ url, txid });
});
