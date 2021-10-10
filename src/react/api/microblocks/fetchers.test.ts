import { setupServer } from 'msw/node';
import * as MICROBLOCK_LIST_200_RESPONSE from '../../../../tests/mocks/api/microblocks/MicroblockListResponse200.json';
import * as MICROBLOCK_200_RESPONSE from '../../../../tests/mocks/api/microblocks/Microblock200.json';
import * as MICROBLOCK_404_RESPONSE from '../../../../tests/mocks/api/microblocks/Microblock404.json';
import * as UNANCHORED_TRANSACTION_LIST_200_RESPONSE from '../../../../tests/mocks/api/microblocks/UnanchoredTransactionListResponse200.json';

import { rest } from 'msw';
import {
  fetchMicroblocks,
  fetchMicroblock,
  fetchMicroblocksUnanchoredTransactions,
} from './fetchers';
import { microblockEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const hash = 'string';

export const GET_MICROBLOCKS_MOCKS = [
  rest.get(microblockEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(MICROBLOCK_LIST_200_RESPONSE));
  }),
  rest.get(microblockEndpoint(HIRO_TESTNET_DEFAULT) + '/' + hash, (_req, res, ctx) => {
    return res(ctx.json(MICROBLOCK_200_RESPONSE));
  }),
  rest.get(microblockEndpoint(HIRO_TESTNET_DEFAULT) + '/' + 'foobar', (_req, res, ctx) => {
    return res(ctx.json(MICROBLOCK_404_RESPONSE));
  }),
  rest.get(microblockEndpoint(HIRO_TESTNET_DEFAULT) + '/unanchored/txs', (_req, res, ctx) => {
    return res(ctx.json(UNANCHORED_TRANSACTION_LIST_200_RESPONSE));
  }),
];

// microblocks.fetchers.spec.ts
describe('microblocks fetchers', () => {
  const server = setupServer(...GET_MICROBLOCKS_MOCKS);
  beforeAll(() => {
    server.listen();
  });
  afterEach(() => {
    server.resetHandlers();
    jest.resetModules();
  });
  afterAll(() => {
    server.close();
  });

  test(fetchMicroblocks.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, limit: 0, offset: 0 };
    const data = await fetchMicroblocks(args);
    expect(data).toEqual(MICROBLOCK_LIST_200_RESPONSE);
  });

  test(fetchMicroblock.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, hash: hash };
    const data = await fetchMicroblock(args);
    expect(data).toEqual(MICROBLOCK_200_RESPONSE);
  });

  test(fetchMicroblock.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, hash: 'foobar' };
    const data = await fetchMicroblock(args);
    expect(data).toEqual(MICROBLOCK_404_RESPONSE);
  });

  test(fetchMicroblocksUnanchoredTransactions.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchMicroblocksUnanchoredTransactions(args);
    expect(data).toEqual(UNANCHORED_TRANSACTION_LIST_200_RESPONSE);
  });
});
