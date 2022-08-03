import { setupServer } from 'msw/node';
import * as BLOCK_LIST_200_RESPONSE from '../../../tests/mocks/api/blocks/BlockListResponse200.json';
import * as BLOCK_200_RESPONSE from '../../../tests/mocks/api/blocks/Block200.json';
import * as BLOCK_404_RESPONSE from '../../../tests/mocks/api/blocks/Block404.json';

import { rest } from 'msw';
import {
  fetchBlocks,
  fetchBlock,
  fetchBlockByHeight,
  fetchBlockByBurnBlockHash,
  fetchBlockByBurnBlockHeight,
} from './fetchers';
import { blockEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const hash = '0xe77ba8cf6bb7c0e4f64adc83356289ed467d31a22354907b4bb814590058430f';
const height = 3275;
const burn_block_hash = '0xb154c008df2101023a6d0d54986b3964cee58119eed14f5bed98e15678e18fe2';
const burn_block_height = 654439;

export const GET_BLOCKS_MOCKS = [
  rest.get(blockEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(BLOCK_LIST_200_RESPONSE));
  }),
  rest.get(blockEndpoint(HIRO_TESTNET_DEFAULT) + '/' + hash, (_req, res, ctx) => {
    return res(ctx.json(BLOCK_200_RESPONSE));
  }),
  rest.get(blockEndpoint(HIRO_TESTNET_DEFAULT) + '/' + 'foobar', (_req, res, ctx) => {
    return res(ctx.json(BLOCK_404_RESPONSE));
  }),
  rest.get(blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_height/' + height, (_req, res, ctx) => {
    return res(ctx.json(BLOCK_200_RESPONSE));
  }),
  rest.get(blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_height/' + 123456789, (_req, res, ctx) => {
    return res(ctx.json(BLOCK_404_RESPONSE));
  }),
  rest.get(
    blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_burn_block_hash/' + burn_block_hash,
    (_req, res, ctx) => {
      return res(ctx.json(BLOCK_200_RESPONSE));
    }
  ),
  rest.get(
    blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_burn_block_hash/' + 'foobar',
    (_req, res, ctx) => {
      return res(ctx.json(BLOCK_404_RESPONSE));
    }
  ),
  rest.get(
    blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_burn_block_height/' + burn_block_height,
    (_req, res, ctx) => {
      return res(ctx.json(BLOCK_200_RESPONSE));
    }
  ),
  rest.get(
    blockEndpoint(HIRO_TESTNET_DEFAULT) + '/by_burn_block_height/' + 123456789,
    (_req, res, ctx) => {
      return res(ctx.json(BLOCK_404_RESPONSE));
    }
  ),
];

// blocks.fetchers.spec.ts
describe('blocks fetchers', () => {
  const server = setupServer(...GET_BLOCKS_MOCKS);
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

  test(fetchBlocks.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchBlocks(args);
    expect(data).toEqual(BLOCK_LIST_200_RESPONSE);
  });

  test(fetchBlock.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, hash: hash };
    const data = await fetchBlock(args);
    expect(data).toEqual(BLOCK_200_RESPONSE);
  });

  test(fetchBlock.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, hash: 'foobar' };
    const data = await fetchBlock(args);
    expect(data).toEqual(BLOCK_404_RESPONSE);
  });

  test(fetchBlockByHeight.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, height: height };
    const data = await fetchBlockByHeight(args);
    expect(data).toEqual(BLOCK_200_RESPONSE);
  });

  test(fetchBlockByHeight.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, height: 123456789 };
    const data = await fetchBlockByHeight(args);
    expect(data).toEqual(BLOCK_404_RESPONSE);
  });

  test(fetchBlockByBurnBlockHash.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, burn_block_hash: burn_block_hash };
    const data = await fetchBlockByBurnBlockHash(args);
    expect(data).toEqual(BLOCK_200_RESPONSE);
  });

  test(fetchBlockByBurnBlockHash.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, burn_block_hash: 'foobar' };
    const data = await fetchBlockByBurnBlockHash(args);
    expect(data).toEqual(BLOCK_404_RESPONSE);
  });

  test(fetchBlockByBurnBlockHeight.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, burn_block_height: burn_block_height };
    const data = await fetchBlockByBurnBlockHeight(args);
    expect(data).toEqual(BLOCK_200_RESPONSE);
  });

  test(fetchBlockByBurnBlockHeight.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, burn_block_height: 123456789 };
    const data = await fetchBlockByBurnBlockHeight(args);
    expect(data).toEqual(BLOCK_404_RESPONSE);
  });
});
