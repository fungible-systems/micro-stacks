import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchBlocks,
  fetchBlock,
  fetchBlockByHeight,
  fetchBlockByBurnBlockHash,
  fetchBlockByBurnBlockHeight,
} from '../../../api/blocks/fetchers';
import { BlocksClientKeys } from './keys';

import type {
  NetworkWithLimitOffset,
  NetworkWithBlockHash,
  NetworkWithBlockHeight,
  NetworkWithBurnBlockHash,
  NetworkWithBurnBlockHeight,
} from '../../types';
import type { BlockListResponse, Block } from '@stacks/stacks-blockchain-api-types';

export const blocksClientAtom = atomFamilyWithQuery<NetworkWithLimitOffset, BlockListResponse>(
  BlocksClientKeys.Blocks,
  async function queryFn(get, [url, limit, offset]) {
    return fetchBlocks({ url, limit, offset });
  }
);

export const blockClientAtom = atomFamilyWithQuery<NetworkWithBlockHash, Block>(
  BlocksClientKeys.Block,
  async function queryFn(get, [url, hash]) {
    return fetchBlock({ url, hash });
  }
);

export const blockByHeightClientAtom = atomFamilyWithQuery<NetworkWithBlockHeight, Block>(
  BlocksClientKeys.BlockByHeight,
  async function queryFn(get, [url, height]) {
    return fetchBlockByHeight({ url, height });
  }
);

export const blockByBurnBlockHashClientAtom = atomFamilyWithQuery<NetworkWithBurnBlockHash, Block>(
  BlocksClientKeys.BlockByBurnBlockHash,
  async function queryFn(get, [url, burn_block_hash]) {
    return fetchBlockByBurnBlockHash({ url, burn_block_hash });
  }
);

export const blockByBurnBlockHeightClientAtom = atomFamilyWithQuery<
  NetworkWithBurnBlockHeight,
  Block
>(BlocksClientKeys.BlockByBurnBlockHeight, async function queryFn(get, [url, burn_block_height]) {
  return fetchBlockByBurnBlockHeight({ url, burn_block_height });
});
