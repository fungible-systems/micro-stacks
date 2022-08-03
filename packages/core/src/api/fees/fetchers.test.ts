import { setupServer } from 'msw/node';
const FEES_TRANSFER_200_RESPONSE = '1';

import { rest } from 'msw';
import { feesSearch } from './fetchers';
import { feesEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

export const GET_FEES_MOCKS = [
  rest.get(feesEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(FEES_TRANSFER_200_RESPONSE));
  }),
];

// fees.fetchers.spec.ts
describe('fees fetchers', () => {
  const server = setupServer(...GET_FEES_MOCKS);
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

  test(feesSearch.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await feesSearch(args);
    expect(data).toEqual(FEES_TRANSFER_200_RESPONSE);
  });
});
