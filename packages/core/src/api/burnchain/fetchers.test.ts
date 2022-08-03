import { setupServer } from 'msw/node';
import * as BURNCHAIN_REWARD_SLOT_HOLDERS_LIST_200_RESPONSE from '../../../tests/mocks/api/burnchain/BurnchainRewardSlotHolderListResponse200.json';
import * as BURNCHAIN_REWARD_LIST_200_RESPONSE from '../../../tests/mocks/api/burnchain/BurnchainRewardListResponse200.json';
import * as BURNCHAIN_REWARDS_TOTAL_200_RESPONSE from '../../../tests/mocks/api/burnchain/BurnchainRewardsTotal200.json';

import { rest } from 'msw';
import {
  fetchBurnchainRewardSlotHolders,
  fetchBurnchainRewardSlotHoldersByAddress,
  fetchBurnchainRewards,
  fetchBurnchainRewardsByAddress,
  fetchTotalBurnchainRewardsByAddress,
} from './fetchers';
import { burnchainEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const address = '1C56LYirKa3PFXFsvhSESgDy2acEHVAEt6';

export const GET_BURNCHAIN_MOCKS = [
  rest.get(burnchainEndpoint(HIRO_TESTNET_DEFAULT) + '/reward_slot_holders', (_req, res, ctx) => {
    return res(ctx.json(BURNCHAIN_REWARD_SLOT_HOLDERS_LIST_200_RESPONSE));
  }),
  rest.get(
    burnchainEndpoint(HIRO_TESTNET_DEFAULT) + '/reward_slot_holders/' + address,
    (_req, res, ctx) => {
      return res(ctx.json(BURNCHAIN_REWARD_SLOT_HOLDERS_LIST_200_RESPONSE));
    }
  ),
  rest.get(burnchainEndpoint(HIRO_TESTNET_DEFAULT) + '/rewards', (_req, res, ctx) => {
    return res(ctx.json(BURNCHAIN_REWARD_LIST_200_RESPONSE));
  }),
  rest.get(burnchainEndpoint(HIRO_TESTNET_DEFAULT) + '/rewards/' + address, (_req, res, ctx) => {
    return res(ctx.json(BURNCHAIN_REWARD_LIST_200_RESPONSE));
  }),
  rest.get(
    burnchainEndpoint(HIRO_TESTNET_DEFAULT) + '/rewards/' + address + '/total',
    (_req, res, ctx) => {
      return res(ctx.json(BURNCHAIN_REWARDS_TOTAL_200_RESPONSE));
    }
  ),
];

// burnchain.fetchers.spec.ts
describe('burnchain fetchers', () => {
  const server = setupServer(...GET_BURNCHAIN_MOCKS);
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    // jest.resetModules();
  });
  afterAll(() => {
    server.close();
  });

  test(fetchBurnchainRewardSlotHolders.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, limit: 0, offset: 0 };
    const data = await fetchBurnchainRewardSlotHolders(args);
    expect(data).toEqual(BURNCHAIN_REWARD_SLOT_HOLDERS_LIST_200_RESPONSE);
  });

  test(fetchBurnchainRewardSlotHoldersByAddress.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, limit: 0, offset: 0, address: address };
    const data = await fetchBurnchainRewardSlotHoldersByAddress(args);
    expect(data).toEqual(BURNCHAIN_REWARD_SLOT_HOLDERS_LIST_200_RESPONSE);
  });

  test(fetchBurnchainRewards.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, limit: 0, offset: 0 };
    const data = await fetchBurnchainRewards(args);
    expect(data).toEqual(BURNCHAIN_REWARD_LIST_200_RESPONSE);
  });

  test(fetchBurnchainRewardsByAddress.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, limit: 0, offset: 0, address: address };
    const data = await fetchBurnchainRewardsByAddress(args);
    expect(data).toEqual(BURNCHAIN_REWARD_LIST_200_RESPONSE);
  });

  test(fetchTotalBurnchainRewardsByAddress.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, address: address };
    const data = await fetchTotalBurnchainRewardsByAddress(args);
    expect(data).toEqual(BURNCHAIN_REWARDS_TOTAL_200_RESPONSE);
  });
});
