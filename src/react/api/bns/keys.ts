import { makeQueryKey } from 'jotai-query-toolkit';

export enum BnsClientKeys {
  NamespacePrice = 'bns/NamespacePrice',
  NamePrice = 'bns/NamePrice',
  Namespaces = 'bns/Namespaces',
  NamesFromNamespaces = 'bns/NamesFromNamespaces',
  Names = 'bns/Names',
  Name = 'bns/Name',
  NameHistory = 'bns/NameHistory',
  ZoneFile = 'bns/ZoneFile',
  HistoricalZoneFile = 'bns/HistoricalZoneFile',
  NamesByAddress = 'bns/NamesByAddress',
  AllSubdomains = 'bns/AllSubdomains',
  SubdomainAtTransaction = 'bns/SubdomainAtTransaction',
}

export const makeBnsClientKeys = {
  namespacePrice: (params: [url: string, tld: string]) =>
    makeQueryKey(BnsClientKeys.NamespacePrice, params),
  namePrice: (params: [url: string, name: string]) => makeQueryKey(BnsClientKeys.NamePrice, params),
  namespaces: (params: [url: string]) => makeQueryKey(BnsClientKeys.Namespaces, params),
  namesFromNamespaces: (params: [url: string, tld: string]) =>
    makeQueryKey(BnsClientKeys.NamesFromNamespaces, params),
  names: (params: [url: string, page: number]) => makeQueryKey(BnsClientKeys.Names, params),
  name: (params: [url: string, name: string]) => makeQueryKey(BnsClientKeys.Name, params),
  nameHistory: (params: [url: string, name: string]) =>
    makeQueryKey(BnsClientKeys.NameHistory, params),
  zoneFile: (params: [url: string, name: string]) => makeQueryKey(BnsClientKeys.ZoneFile, params),
  historicalZoneFile: (params: [url: string, name: string, zoneFileHash: string]) =>
    makeQueryKey(BnsClientKeys.HistoricalZoneFile, params),
  namesByAddress: (params: [url: string, blockchain: string, address: string]) =>
    makeQueryKey(BnsClientKeys.NamesByAddress, params),
  allSubdomains: (params: [url: string, page: number]) =>
    makeQueryKey(BnsClientKeys.AllSubdomains, params),
  subdomainAtTransaction: (params: [url: string, txid: string]) =>
    makeQueryKey(BnsClientKeys.SubdomainAtTransaction, params),
};
