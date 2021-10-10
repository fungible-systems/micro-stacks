import { setupServer } from 'msw/node';
import * as CORE_NODE_INFO_RESPONSE from '../../../../tests/mocks/api/info/CoreNodeInfoResponse.json';
import { rest } from 'msw';
import { fetchCoreApiInfo } from './fetchers';
import { infoEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

export const GET_INFO_MOCKS = [
  rest.get(infoEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(CORE_NODE_INFO_RESPONSE));
  }),
];

// info.fetchers.spec.ts
describe('info fetchers', () => {
  const server = setupServer(...GET_INFO_MOCKS);
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
  test(fetchCoreApiInfo.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT }; // default params
    const data = await fetchCoreApiInfo(args); // fetch the data (mocked via msw)
    expect(data).toEqual(CORE_NODE_INFO_RESPONSE); // expect the results to equal the mocked data
  });
});
