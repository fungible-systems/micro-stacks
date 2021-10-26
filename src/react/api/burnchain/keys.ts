import { makeQueryKey } from 'jotai-query-toolkit';
import {
  NetworkWithLimitOffset,
  NetworkWithAddressLimitOffset,
  NetworkWithAddress,
} from '../../types';

export enum BurnchainClientKeys {
  RewardSlotHolders = 'burnchain/RewardSlotHolders',
  RewardSlotHoldersByAddress = 'burnchain/RewardSlotHoldersByAddress',
  Rewards = 'burnchain/Rewards',
  RewardsByAddress = 'burnchain/RewardsByAddress',
  TotalRewardsByAddress = 'burnchain/TotalRewardsByAddress',
}

export const makeBurnchainClientKeys = {
  rewardSlotHolders: (params: NetworkWithLimitOffset) =>
    makeQueryKey(BurnchainClientKeys.RewardSlotHolders, params),
  rewardSlotHoldersByAddress: (params: NetworkWithAddressLimitOffset) =>
    makeQueryKey(BurnchainClientKeys.RewardSlotHoldersByAddress, params),
  rewards: (params: NetworkWithLimitOffset) => makeQueryKey(BurnchainClientKeys.Rewards, params),
  rewardsByAddress: (params: NetworkWithAddressLimitOffset) =>
    makeQueryKey(BurnchainClientKeys.RewardsByAddress, params),
  totalRewardsByAddress: (params: NetworkWithAddress) =>
    makeQueryKey(BurnchainClientKeys.TotalRewardsByAddress, params),
};
