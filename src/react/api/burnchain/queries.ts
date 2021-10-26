import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeBurnchainClientKeys } from './keys';
import {
  fetchBurnchainRewardSlotHolders,
  fetchBurnchainRewardSlotHoldersByAddress,
  fetchBurnchainRewards,
  fetchBurnchainRewardsByAddress,
  fetchBurnchainTotalRewardsByAddress,
} from '../../../api/burnchain/fetchers';

export interface BurnchainNetworkWithLimitOffsetQueryParams {
  networkUrl: string;
  limit?: number;
  offset?: number;
}

export interface BurnchainNetworkWithAddressLimitOffsetQueryParams {
  networkUrl: string;
  address: string;
  limit?: number;
  offset?: number;
}

export interface BurnchainNetworkWithAddressQueryParams {
  networkUrl: string;
  address: string;
}

export function burnchainRewardSlotHoldersQuery(
  params: BurnchainNetworkWithLimitOffsetQueryParams
): Queries[number] {
  const { networkUrl, limit, offset } = params;
  return [
    makeBurnchainClientKeys.rewardSlotHolders([networkUrl, limit, offset]),
    async () =>
      fetchBurnchainRewardSlotHolders({
        url: networkUrl,
        limit,
        offset,
      }),
  ];
}

export function burnchainRewardSlotHoldersByAddressQuery(
  params: BurnchainNetworkWithAddressLimitOffsetQueryParams
): Queries[number] {
  const { networkUrl, address, limit, offset } = params;
  return [
    makeBurnchainClientKeys.rewardSlotHoldersByAddress([networkUrl, address, limit, offset]),
    async () =>
      fetchBurnchainRewardSlotHoldersByAddress({
        url: networkUrl,
        address,
        limit,
        offset,
      }),
  ];
}

export function burnchainRewardsQuery(
  params: BurnchainNetworkWithLimitOffsetQueryParams
): Queries[number] {
  const { networkUrl, limit, offset } = params;
  return [
    makeBurnchainClientKeys.rewards([networkUrl, limit, offset]),
    async () =>
      fetchBurnchainRewards({
        url: networkUrl,
        limit,
        offset,
      }),
  ];
}

export function burnchainRewardsByAddressQuery(
  params: BurnchainNetworkWithAddressLimitOffsetQueryParams
): Queries[number] {
  const { networkUrl, address, limit, offset } = params;
  return [
    makeBurnchainClientKeys.rewardsByAddress([networkUrl, address, limit, offset]),
    async () =>
      fetchBurnchainRewardsByAddress({
        url: networkUrl,
        address,
        limit,
        offset,
      }),
  ];
}

export function burnchainTotalRewardsByAddressQuery(
  params: BurnchainNetworkWithAddressQueryParams
): Queries[number] {
  const { networkUrl, address } = params;
  return [
    makeBurnchainClientKeys.totalRewardsByAddress([networkUrl, address]),
    async () =>
      fetchBurnchainTotalRewardsByAddress({
        url: networkUrl,
        address,
      }),
  ];
}
