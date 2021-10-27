import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeTokensClientKeys } from './keys';
import {
  fetchFtMetadataList,
  fetchNftMetadataList,
  fetchNftMetadataForContractId,
  fetchFtMetadataForContractId,
} from '../../../api/tokens/fetchers';

export interface TokenListsQueryParams {
  networkUrl: string;
}

export interface TokenListsByContractIdQueryParams {
  networkUrl: string;
  contractId: string;
}

export function ftMetadataListQuery(params: TokenListsQueryParams): Queries[number] {
  const { networkUrl } = params;
  return [
    makeTokensClientKeys.ftMetadataList([networkUrl]),
    async () =>
      fetchFtMetadataList({
        url: networkUrl,
      }),
  ];
}

export function nftMetadataListQuery(params: TokenListsQueryParams): Queries[number] {
  const { networkUrl } = params;
  return [
    makeTokensClientKeys.nftMetadataList([networkUrl]),
    async () =>
      fetchNftMetadataList({
        url: networkUrl,
      }),
  ];
}

export function nftMetadataForContractId(
  params: TokenListsByContractIdQueryParams
): Queries[number] {
  const { networkUrl, contractId } = params;
  return [
    makeTokensClientKeys.nftMetadataForContractId([networkUrl, contractId]),
    async () =>
      fetchNftMetadataForContractId({
        url: networkUrl,
        contractId,
      }),
  ];
}

export function ftMetadataForContractId(
  params: TokenListsByContractIdQueryParams
): Queries[number] {
  const { networkUrl, contractId } = params;
  return [
    makeTokensClientKeys.ftMetadataForContractId([networkUrl, contractId]),
    async () =>
      fetchFtMetadataForContractId({
        url: networkUrl,
        contractId,
      }),
  ];
}
