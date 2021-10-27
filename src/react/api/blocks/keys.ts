import { makeQueryKey } from 'jotai-query-toolkit';
import {
  NetworkWithLimitOffset,
  NetworkWithBlockHash,
  NetworkWithBlockHeight,
  NetworkWithBurnBlockHash,
  NetworkWithBurnBlockHeight,
} from '../../types';

export enum BlocksClientKeys {
  Blocks = 'blocks/Blocks',
  Block = 'blocks/Block',
  BlockByHeight = 'blocks/BlockByHeight',
  BlockByBurnBlockHash = 'blocks/BlockByBurnBlockHash',
  BlockByBurnBlockHeight = 'blocks/BlockByBurnBlockHeight',
}

export const makeBlocksClientKeys = {
  blocks: (params: NetworkWithLimitOffset) => makeQueryKey(BlocksClientKeys.Blocks, params),
  block: (params: NetworkWithBlockHash) => makeQueryKey(BlocksClientKeys.Block, params),
  blockByHeight: (params: NetworkWithBlockHeight) =>
    makeQueryKey(BlocksClientKeys.BlockByHeight, params),
  blockByBurnBlockHash: (params: NetworkWithBurnBlockHash) =>
    makeQueryKey(BlocksClientKeys.BlockByBurnBlockHash, params),
  blockByBurnBlockHeight: (params: NetworkWithBurnBlockHeight) =>
    makeQueryKey(BlocksClientKeys.BlockByBurnBlockHeight, params),
};
