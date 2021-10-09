import {
  BurnchainRewardSlotHolderListResponse,
  BurnchainRewardListResponse,
  BurnchainRewardsTotal,
} from '@stacks/stacks-blockchain-api-types';
import { BaseListParams } from '../types';
import { fetchJson, generateUrl, burnchainEndpoint } from '../utils';

/**
 * Get recent reward slot holders
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_burnchain_reward_slot_holders
 */

export async function fetchBurnchainRewardSlotHolders({ url, limit, offset }: BaseListParams) {
  const path = generateUrl(`${burnchainEndpoint(url)}/reward_slot_holders`, {
    limit,
    offset,
  });
  return fetchJson<BurnchainRewardSlotHolderListResponse>(path);
}

/**
 * Get recent reward slot holder entries for the given address
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_burnchain_reward_slot_holders_by_address
 */

export async function fetchBurnchainRewardSlotHoldersByAddress({
  url,
  limit,
  offset,
  address,
}: BaseListParams & { address: string }) {
  const path = generateUrl(`${burnchainEndpoint(url)}/${address}`, {
    limit,
    offset,
  });
  return fetchJson<BurnchainRewardSlotHolderListResponse>(path);
}

/**
 * Get recent burnchain reward recipients
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_burnchain_reward_list
 */

export async function fetchBurnchainRewards({ url, limit, offset }: BaseListParams) {
  const path = generateUrl(`${burnchainEndpoint(url)}/rewards`, {
    limit,
    offset,
  });
  return fetchJson<BurnchainRewardListResponse>(path);
}

/**
 * Get recent burnchain reward for the given recipient
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_burnchain_reward_slot_holders_by_address
 */

export async function fetchBurnchainRewardsByAddress({
  url,
  limit,
  offset,
  address,
}: BaseListParams & { address: string }) {
  const path = generateUrl(`${burnchainEndpoint(url)}/rewards/${address}`, {
    limit,
    offset,
  });
  return fetchJson<BurnchainRewardListResponse>(path);
}

/**
 * Get total burnchain rewards for the given recipient
 *
 * @see https://blockstack.github.io/stacks-blockchain-api/#operation/get_burnchain_rewards_total_by_address
 */

export async function fetchTotalBurnchainRewardsByAddress({
  url,
  address,
}: BaseListParams & { address: string }) {
  const path = generateUrl(`${burnchainEndpoint(url)}/rewards/${address}/total`, {});
  return fetchJson<BurnchainRewardsTotal>(path);
}
