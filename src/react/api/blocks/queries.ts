import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeBlocksClientKeys } from './keys';
import {
  fetchBlocks,
  fetchBlock,
  fetchBlockByHeight,
  fetchBlockByBurnBlockHash,
  fetchBlockByBurnBlockHeight,
} from '../../../api/blocks/fetchers';

export interface BlocksQueryParams {
  networkUrl: string;
  limit?: number;
  offset?: number;
}

export interface BlockQueryParams {
  networkUrl: string;
  hash: string;
}

export interface BlockByHeightQueryParams {
  networkUrl: string;
  height: number;
}

export interface BlockByBurnBlockHashQueryParams {
  networkUrl: string;
  burn_block_hash: string;
}

export interface BlockByBurnBlockHeightQueryParams {
  networkUrl: string;
  burn_block_height: number;
}

export function blocksQuery(params: BlocksQueryParams): Queries[number] {
  const { networkUrl, limit, offset } = params;
  return [
    makeBlocksClientKeys.blocks([networkUrl, limit, offset]),
    async () =>
      fetchBlocks({
        url: networkUrl,
        limit,
        offset,
      }),
  ];
}

export function blockQuery(params: BlockQueryParams): Queries[number] {
  const { networkUrl, hash } = params;
  return [
    makeBlocksClientKeys.block([networkUrl, hash]),
    async () =>
      fetchBlock({
        url: networkUrl,
        hash,
      }),
  ];
}

export function blockByHeightQuery(params: BlockByHeightQueryParams): Queries[number] {
  const { networkUrl, height } = params;
  return [
    makeBlocksClientKeys.blockByHeight([networkUrl, height]),
    async () =>
      fetchBlockByHeight({
        url: networkUrl,
        height,
      }),
  ];
}

export function blockByBurnBlockHashQuery(
  params: BlockByBurnBlockHashQueryParams
): Queries[number] {
  const { networkUrl, burn_block_hash } = params;
  return [
    makeBlocksClientKeys.blockByBurnBlockHash([networkUrl, burn_block_hash]),
    async () =>
      fetchBlockByBurnBlockHash({
        url: networkUrl,
        burn_block_hash,
      }),
  ];
}

export function blockByBurnBlockHeightQuery(
  params: BlockByBurnBlockHeightQueryParams
): Queries[number] {
  const { networkUrl, burn_block_height } = params;
  return [
    makeBlocksClientKeys.blockByBurnBlockHeight([networkUrl, burn_block_height]),
    async () =>
      fetchBlockByBurnBlockHeight({
        url: networkUrl,
        burn_block_height,
      }),
  ];
}
