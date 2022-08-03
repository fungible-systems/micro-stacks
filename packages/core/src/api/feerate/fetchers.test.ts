import { setupServer } from 'msw/node';
import * as FEE_RATE_RESPONSE from '../../../tests/mocks/api/feerate/FeeRate.json';
import { rest } from 'msw';
import { fetchFeeRate } from './fetchers';
import { feeRateEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

// convert json modules to js objects
const FEE_RATE_RESPONSE_OBJ = JSON.parse(JSON.stringify(FEE_RATE_RESPONSE));


const transaction = '0x5e9f3933e358df6a73fec0d47ce3e1062c20812c129f5294e6f37a8d27c051d9';

// TODO: not validating whether the request is passing in an address or stacking boolean
export const GET_FEERATE_MOCKS = [
  rest.post(feeRateEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(FEE_RATE_RESPONSE_OBJ));
  }),
];

// feerate.fetchers.spec.ts
describe('feerate fetchers', () => {
  const server = setupServer(...GET_FEERATE_MOCKS);
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

  // TODO: use real addresses here?
  test(fetchFeeRate.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, transaction: transaction };
    const data = await fetchFeeRate(args);
    expect(data).toEqual(FEE_RATE_RESPONSE_OBJ);
  });
});
