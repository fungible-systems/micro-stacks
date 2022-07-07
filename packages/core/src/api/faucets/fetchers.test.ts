import { setupServer } from 'msw/node';
import * as RUN_FAUCET_RESPONSE from '../../../tests/mocks/api/faucets/RunFaucetResponse.json';
import { rest } from 'msw';
import { fetchGetStxTokens, fetchGetBtcTokens } from './fetchers';
import { stxFaucetEndpoint, btcFaucetEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

// TODO: not validating whether the request is passing in an address or stacking boolean
export const GET_FAUCET_MOCKS = [
  rest.post(stxFaucetEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(RUN_FAUCET_RESPONSE));
  }),
  rest.post(btcFaucetEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(RUN_FAUCET_RESPONSE));
  }),
];

// faucets.fetchers.spec.ts
describe('faucets fetchers', () => {
  const server = setupServer(...GET_FAUCET_MOCKS);
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

  // TODO: use real addresses here?
  test(fetchGetStxTokens.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, address: 'anystring' };
    const data = await fetchGetStxTokens(args);
    expect(data).toEqual(RUN_FAUCET_RESPONSE);
  });

  test(fetchGetBtcTokens.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, address: 'anystring' };
    const data = await fetchGetBtcTokens(args);
    expect(data).toEqual(RUN_FAUCET_RESPONSE);
  });
});
