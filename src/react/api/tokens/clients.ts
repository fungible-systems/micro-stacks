import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchFtMetadataList,
  fetchNftMetadataList,
  fetchNftMetadataForContractId,
  fetchFtMetadataForContractId,
} from '../../../api/tokens/fetchers';
import { TokensClientKeys } from './keys';

import type { WithNetwork } from '../../types';
import type {
  FungibleTokensMetadataList,
  NonFungibleTokensMetadataList,
  NonFungibleTokenMetadata,
  FungibleTokenMetadata,
} from '@stacks/stacks-blockchain-api-types';

export const ftMetadataListClientAtom = atomFamilyWithQuery<
  WithNetwork,
  FungibleTokensMetadataList
>(TokensClientKeys.FtMetadataList, async function queryFn(get, [url]) {
  return fetchFtMetadataList({ url });
});

export const nftMetadataListClientAtom = atomFamilyWithQuery<
  WithNetwork,
  NonFungibleTokensMetadataList
>(TokensClientKeys.NftMetadataList, async function queryFn(get, [url]) {
  return fetchNftMetadataList({ url });
});

export const nftMetadataForContractIdAtom = atomFamilyWithQuery<
  WithNetwork & { contractId: string },
  NonFungibleTokenMetadata
>(TokensClientKeys.NftMetadataForContractId, async function queryFn(get, [url, contractId]) {
  return fetchNftMetadataForContractId({ url, contractId });
});

export const ftMetadataForContractIdAtom = atomFamilyWithQuery<
  WithNetwork & { contractId: string },
  FungibleTokenMetadata
>(TokensClientKeys.FtMetadataForContractId, async function queryFn(get, [url, contractId]) {
  return fetchFtMetadataForContractId({ url, contractId });
});
