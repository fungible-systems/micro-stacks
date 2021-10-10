import { setupServer } from 'msw/node';
import * as CORE_NODE_INFO_RESPONSE from '../../../../tests/mocks/api/info/CoreNodeInfoResponse.json';
import * as SERVER_STATUS_RESPONSE from '../../../../tests/mocks/api/info/ServerStatusResponse.json';
import * as NETWORK_BLOCK_TIMES_RESPONSE from '../../../../tests/mocks/api/info/NetworkBlockTimesResponse.json';
import * as NETWORK_BLOCK_TIME_RESPONSE from '../../../../tests/mocks/api/info/NetworkBlockTimeResponse.json';
import * as GET_STX_SUPPLY_RESPONSE from '../../../../tests/mocks/api/info/GetStxSupplyResponse.json';
const GET_STX_TOTAL_SUPPLY_PLAIN_RESPONSE = 123.456789;
const GET_STX_CIRCULATING_SUPPLY_PLAIN_RESPONSE = 123.456789;
import * as GET_STX_SUPPLY_LEGACY_FORMAT_RESPONSE from '../../../../tests/mocks/api/info/GetStxSupplyLegacyFormatResponse.json';
import * as CORE_NODE_POX_RESPONSE from '../../../../tests/mocks/api/info/CoreNodePoxResponse.json';

import { rest } from 'msw';
import {
  fetchCoreApiInfo,
  fetchStatus,
  fetchNetworkBlockTimes,
  fetchNetworkBlockTime,
  fetchStxSupply,
  fetchStxSupplyPlain,
  fetchStxSupplyCirculatingPlain,
  fetchStxSupplyLegacyFormat,
  fetchPox,
} from './fetchers';
import {
  infoEndpoint,
  statusEndpoint,
  networkBlockTimesEndpoint,
  networkBlockTimeEndpoint,
  stxSupplyEndpoint,
  stxSupplyPlainEndpoint,
  stxSupplyCirculatingPlainEndpoint,
  stxSupplyLegacyFormatEndpoint,
  poxEndpoint,
} from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

export const GET_INFO_MOCKS = [
  rest.get(infoEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(CORE_NODE_INFO_RESPONSE));
  }),
  rest.get(statusEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(SERVER_STATUS_RESPONSE));
  }),
  rest.get(networkBlockTimesEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(NETWORK_BLOCK_TIMES_RESPONSE));
  }),
  rest.get(networkBlockTimeEndpoint(HIRO_TESTNET_DEFAULT) + '/testnet', (_req, res, ctx) => {
    return res(ctx.json(NETWORK_BLOCK_TIME_RESPONSE));
  }),
  rest.get(stxSupplyEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(GET_STX_SUPPLY_RESPONSE));
  }),
  rest.get(stxSupplyPlainEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(GET_STX_TOTAL_SUPPLY_PLAIN_RESPONSE));
  }),
  rest.get(stxSupplyCirculatingPlainEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(GET_STX_CIRCULATING_SUPPLY_PLAIN_RESPONSE));
  }),
  rest.get(stxSupplyLegacyFormatEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(GET_STX_SUPPLY_LEGACY_FORMAT_RESPONSE));
  }),
  rest.get(poxEndpoint(HIRO_TESTNET_DEFAULT), (_req, res, ctx) => {
    return res(ctx.json(CORE_NODE_POX_RESPONSE));
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
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchCoreApiInfo(args);
    expect(data).toEqual(CORE_NODE_INFO_RESPONSE);
  });

  test(fetchStatus.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchStatus(args);
    expect(data).toEqual(SERVER_STATUS_RESPONSE);
  });

  test(fetchNetworkBlockTimes.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchNetworkBlockTimes(args);
    expect(data).toEqual(NETWORK_BLOCK_TIMES_RESPONSE);
  });

  test(fetchNetworkBlockTime.name, async () => {
    const network: 'mainnet' | 'testnet' = 'testnet';
    const args = { url: HIRO_TESTNET_DEFAULT, network };
    const data = await fetchNetworkBlockTime(args);
    expect(data).toEqual(NETWORK_BLOCK_TIME_RESPONSE);
  });

  test(fetchStxSupply.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchStxSupply(args);
    expect(data).toEqual(GET_STX_SUPPLY_RESPONSE);
  });

  test(fetchStxSupplyPlain.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchStxSupplyPlain(args);
    expect(data).toEqual(GET_STX_TOTAL_SUPPLY_PLAIN_RESPONSE.toString());
  });

  test(fetchStxSupplyCirculatingPlain.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchStxSupplyCirculatingPlain(args);
    expect(data).toEqual(GET_STX_CIRCULATING_SUPPLY_PLAIN_RESPONSE.toString());
  });

  test(fetchStxSupplyLegacyFormat.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchStxSupplyLegacyFormat(args);
    expect(data).toEqual(GET_STX_SUPPLY_LEGACY_FORMAT_RESPONSE);
  });

  test(fetchPox.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchPox(args);
    expect(data).toEqual(CORE_NODE_POX_RESPONSE);
  });
});
