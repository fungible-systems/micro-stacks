import { BlockListResponse, Block } from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, blockEndpoint } from '../utils';

/**
 * Get recent blocks
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/blocks#fetchblocks
 */

export async function fetchBlocks({ url, limit, offset }: BaseListParams) {
  const path = generateUrl(blockEndpoint(url), {
    limit,
    offset,
  });
  return fetchJson<BlockListResponse>(path);
}

/**
 * Get a specific block by hash
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/blocks#fetchblock
 */

export async function fetchBlock({ url, hash }: BaseListParams & { hash: string }) {
  const path = generateUrl(`${blockEndpoint(url)}/${hash}`, {});
  return fetchJson<Block>(path);
}

/**
 * Get a specific block by height
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/blocks#fetchblockbyheight
 */

export async function fetchBlockByHeight({ url, height }: BaseListParams & { height: number }) {
  const path = generateUrl(`${blockEndpoint(url)}/by_height/${height}`, {});
  return fetchJson<Block>(path);
}

/**
 * Get a specific block by burnchain block hash
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/blocks#fetchblockbyburnblockhash
 */

export async function fetchBlockByBurnBlockHash({
  url,
  burn_block_hash,
}: BaseListParams & { burn_block_hash: string }) {
  const path = generateUrl(`${blockEndpoint(url)}/by_burn_block_hash/${burn_block_hash}`, {});
  return fetchJson<Block>(path);
}

/**
 * Get a specific block by burn chain height
 *
 * @see https://docs.micro-stacks.dev/modules/core/api/blocks#fetchblockbyburnblockheight
 */

export async function fetchBlockByBurnBlockHeight({
  url,
  burn_block_height,
}: BaseListParams & { burn_block_height: number }) {
  const path = generateUrl(`${blockEndpoint(url)}/by_burn_block_height/${burn_block_height}`, {});
  return fetchJson<Block>(path);
}
