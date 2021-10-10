// info.fetchers.spec.ts
import { fetchCoreApiInfo } from './fetchers';
import * as mockedResponse from '../../../../tests/mocks/api/info.json';
const TESTNET_URL = 'https://stacks-node-api.xenon.blockstack.org';

describe('info fetchers', () => {
  test(fetchCoreApiInfo.name, async () => {
    //const mockedResponse = '../../tests/api/info'; //{}; // this would be mocked, by following the msw docs
    const args = { url: TESTNET_URL }; // default params
    const data = await fetchCoreApiInfo(args); // fetch the data (mocked via msw)
    expect(data).toBe(mockedResponse); // expect the results to equal the mocked data
  });
});
