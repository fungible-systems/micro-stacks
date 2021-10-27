import { makeQueryKey } from 'jotai-query-toolkit';
import { WithNetwork, NetworkWithContractId } from '../../types';

export enum TokensClientKeys {
  FtMetadataList = 'tokens/FtMetadataList',
  NftMetadataList = 'tokens/NftMetadataList',
  NftMetadataForContractId = 'tokens/NftMetadataForContractId',
  FtMetadataForContractId = 'tokens/FtMetadataForContractId',
}

export const makeTokensClientKeys = {
  ftMetadataList: (params: WithNetwork) => makeQueryKey(TokensClientKeys.FtMetadataList, params),
  nftMetadataList: (params: WithNetwork) => makeQueryKey(TokensClientKeys.NftMetadataList, params),
  nftMetadataForContractId: (params: NetworkWithContractId) =>
    makeQueryKey(TokensClientKeys.NftMetadataForContractId, params),
  ftMetadataForContractId: (params: NetworkWithContractId) =>
    makeQueryKey(TokensClientKeys.FtMetadataForContractId, params),
};
