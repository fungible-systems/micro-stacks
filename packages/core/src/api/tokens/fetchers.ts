import {
  FungibleTokensMetadataList,
  NonFungibleTokensMetadataList,
  NonFungibleTokenMetadata,
  FungibleTokenMetadata,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, tokensEndpoint } from '../utils';

/**
 * Get list of fungible tokens metadata
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/tokens#fetchftmetadatalist
 */

export async function fetchFtMetadataList({ url }: BaseListParams) {
  const path = generateUrl(`${tokensEndpoint(url)}/ft/metadata`, {});
  return fetchJson<FungibleTokensMetadataList>(path);
}

/**
 * Get list of non fungible tokens metadata
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/tokens#fetchnftmetadatalist
 */

export async function fetchNftMetadataList({ url }: BaseListParams) {
  const path = generateUrl(`${tokensEndpoint(url)}/nft/metadata`, {});
  return fetchJson<NonFungibleTokensMetadataList>(path);
}

/**
 * Non fungible tokens metadata for contract id
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/tokens#fetchnftmetadataforcontractid
 */

export async function fetchNftMetadataForContractId({
  url,
  contractId,
}: BaseListParams & { contractId: string }) {
  const path = generateUrl(`${tokensEndpoint(url)}/${contractId}/nft/metadata`, {});
  return fetchJson<NonFungibleTokenMetadata>(path);
}

/**
 * Fungible tokens metadata for contract id
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/tokens#fetchftmetadataforcontractid
 */

export async function fetchFtMetadataForContractId({
  url,
  contractId,
}: BaseListParams & { contractId: string }) {
  const path = generateUrl(`${tokensEndpoint(url)}/${contractId}/ft/metadata`, {});
  return fetchJson<FungibleTokenMetadata>(path);
}
