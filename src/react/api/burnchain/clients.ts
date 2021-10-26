import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchBurnchainRewardSlotHolders,
  fetchBurnchainRewardSlotHoldersByAddress,
  fetchBurnchainRewards,
  fetchBurnchainRewardsByAddress,
  fetchBurnchainTotalRewardsByAddress,
} from '../../../api/burnchain/fetchers';

import { BurnchainClientKeys } from './keys';

import type {
  NetworkWithLimitOffset,
  NetworkWithAddressLimitOffset,
  NetworkWithAddress,
} from '../../types';

import type {
  BurnchainRewardSlotHolderListResponse,
  BurnchainRewardListResponse,
  BurnchainRewardsTotal,
} from '@stacks/stacks-blockchain-api-types';

export const burnchainRewardSlotHoldersClientAtom = atomFamilyWithQuery<
  NetworkWithLimitOffset,
  BurnchainRewardSlotHolderListResponse
>(BurnchainClientKeys.RewardSlotHolders, async function queryFn(get, [url, limit, offset]) {
  return fetchBurnchainRewardSlotHolders({ url, limit, offset });
});

export const burnchainRewardSlotHoldersByAddressClientAtom = atomFamilyWithQuery<
  NetworkWithAddressLimitOffset,
  BurnchainRewardSlotHolderListResponse
>(
  BurnchainClientKeys.RewardSlotHoldersByAddress,
  async function queryFn(get, [url, address, limit, offset]) {
    return fetchBurnchainRewardSlotHoldersByAddress({ url, address, limit, offset });
  }
);

export const burnchainRewardsClientAtom = atomFamilyWithQuery<
  NetworkWithLimitOffset,
  BurnchainRewardListResponse
>(BurnchainClientKeys.Rewards, async function queryFn(get, [url, limit, offset]) {
  return fetchBurnchainRewards({ url, limit, offset });
});

export const burnchainRewardsByAddressClientAtom = atomFamilyWithQuery<
  NetworkWithAddressLimitOffset,
  BurnchainRewardListResponse
>(BurnchainClientKeys.RewardsByAddress, async function queryFn(get, [url, address, limit, offset]) {
  return fetchBurnchainRewardsByAddress({ url, address, limit, offset });
});

export const burnchainTotalRewardsByAddressClientAtom = atomFamilyWithQuery<
  NetworkWithAddress,
  BurnchainRewardsTotal
>(BurnchainClientKeys.TotalRewardsByAddress, async function queryFn(get, [url, address]) {
  return fetchBurnchainTotalRewardsByAddress({ url, address });
});
