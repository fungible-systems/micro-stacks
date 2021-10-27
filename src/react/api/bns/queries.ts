import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeBnsClientKeys } from './keys';
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

export function namespacePriceQuery(params: { networkUrl: string; tld: string }): Queries[number] {
  const { networkUrl, tld } = params;
  return [
    makeBnsClientKeys.namespacePrice([networkUrl, tld]),
    async () =>
      fetchNamespacePrice({
        url: networkUrl,
        tld,
      }),
  ];
}

export function namePriceQuery(params: { networkUrl: string; name: string }): Queries[number] {
  const { networkUrl, name } = params;
  return [
    makeBnsClientKeys.namePrice([networkUrl, name]),
    async () =>
      fetchNamePrice({
        url: networkUrl,
        name,
      }),
  ];
}

export function namespacesQuery(params: { networkUrl: string }): Queries[number] {
  const { networkUrl } = params;
  return [
    makeBnsClientKeys.namespaces([networkUrl]),
    async () =>
      fetchNamespaces({
        url: networkUrl,
      }),
  ];
}

export function namesFromNamespacesQuery(params: {
  networkUrl: string;
  tld: string;
}): Queries[number] {
  const { networkUrl, tld } = params;
  return [
    makeBnsClientKeys.namesFromNamespaces([networkUrl, tld]),
    async () =>
      fetchNamesFromNamespaces({
        url: networkUrl,
        tld,
      }),
  ];
}

export function namesQuery(params: { networkUrl: string; page: number }): Queries[number] {
  const { networkUrl, page } = params;
  return [
    makeBnsClientKeys.names([networkUrl, page]),
    async () =>
      fetchNames({
        url: networkUrl,
        page,
      }),
  ];
}

export function nameQuery(params: { networkUrl: string; name: string }): Queries[number] {
  const { networkUrl, name } = params;
  return [
    makeBnsClientKeys.name([networkUrl, name]),
    async () =>
      fetchName({
        url: networkUrl,
        name,
      }),
  ];
}

export function nameHistoryQuery(params: { networkUrl: string; name: string }): Queries[number] {
  const { networkUrl, name } = params;
  return [
    makeBnsClientKeys.nameHistory([networkUrl, name]),
    async () =>
      fetchNameHistory({
        url: networkUrl,
        name,
      }),
  ];
}

export function zoneFileQuery(params: { networkUrl: string; name: string }): Queries[number] {
  const { networkUrl, name } = params;
  return [
    makeBnsClientKeys.zoneFile([networkUrl, name]),
    async () =>
      fetchZoneFile({
        url: networkUrl,
        name,
      }),
  ];
}

export function historicalZoneFileQuery(params: {
  networkUrl: string;
  name: string;
  zoneFileHash: string;
}): Queries[number] {
  const { networkUrl, name, zoneFileHash } = params;
  return [
    makeBnsClientKeys.historicalZoneFile([networkUrl, name, zoneFileHash]),
    async () =>
      fetchHistoricalZoneFile({
        url: networkUrl,
        name,
        zoneFileHash,
      }),
  ];
}

export function namesByAddressQuery(params: {
  networkUrl: string;
  blockchain: string;
  address: string;
}): Queries[number] {
  const { networkUrl, blockchain, address } = params;
  return [
    makeBnsClientKeys.namesByAddress([networkUrl, blockchain, address]),
    async () =>
      fetchNamesByAddress({
        url: networkUrl,
        blockchain,
        address,
      }),
  ];
}

export function allSubdomainsQuery(params: { networkUrl: string; page: number }): Queries[number] {
  const { networkUrl, page } = params;
  return [
    makeBnsClientKeys.allSubdomains([networkUrl, page]),
    async () =>
      fetchAllSubdomains({
        url: networkUrl,
        page,
      }),
  ];
}

export function subdomainAtTransactionQuery(params: {
  networkUrl: string;
  txid: string;
}): Queries[number] {
  const { networkUrl, txid } = params;
  return [
    makeBnsClientKeys.subdomainAtTransaction([networkUrl, txid]),
    async () =>
      fetchSubdomainAtTransaction({
        url: networkUrl,
        txid,
      }),
  ];
}
