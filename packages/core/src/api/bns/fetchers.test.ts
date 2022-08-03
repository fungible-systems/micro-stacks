import { setupServer } from 'msw/node';

import * as BNS_GET_NAMESPACE_PRICE_200_RESPONSE from '../../../tests/mocks/api/bns/BnsGetNamespacePriceResponse200.json';
import * as BNS_GET_NAMES_PRICE_200_RESPONSE from '../../../tests/mocks/api/bns/BnsGetNamePriceResponse200.json';
import * as BNS_GET_ALL_NAMESPACES_200_RESPONSE from '../../../tests/mocks/api/bns/BnsGetAllNamespacesResponse200.json';
import * as BNS_GET_NAME_INFO_200_RESPONSE from '../../../tests/mocks/api/bns/BnsGetNameInfoResponse200.json';
// import * as BNS_ERROR_400_RESPONSE from '../../../tests/mocks/api/bns/BnsError400.json';
// import * as BNS_ERROR_404_RESPONSE from '../../../tests/mocks/api/bns/BnsError404.json';
import * as BNS_FETCH_HISTORICAL_ZONEFILE_200_RESPONSE from '../../../tests/mocks/api/bns/BnsFetchHistoricalZoneFileResponse200.json';
import * as BNS_FETCH_FILEZONE_200_RESPONSE from '../../../tests/mocks/api/bns/BnsFetchFileZoneResponse200.json';
import * as BNS_NAMES_OWN_BY_ADDRESS_200_RESPONSE from '../../../tests/mocks/api/bns/BnsNamesOwnByAddressResponse200.json';
import * as BNS_ALL_SUBDOMAINS_200_RESPONSE from '../../../tests/mocks/api/bns/bns-all-subdomains.json';
import * as BNS_SUBDOMAINS_AT_TRANSACTION_200_RESPONSE from '../../../tests/mocks/api/bns/BnsGetSubdomainAtTx200.json';
import * as BNS_NAMES_200_RESPONSE from '../../../tests/mocks/api/bns/bns-names.json';
// convert json modules to js objects
const BNS_GET_NAMESPACE_PRICE_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_GET_NAMESPACE_PRICE_200_RESPONSE));
const BNS_GET_NAMES_PRICE_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_GET_NAMES_PRICE_200_RESPONSE));
const BNS_GET_ALL_NAMESPACES_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_GET_ALL_NAMESPACES_200_RESPONSE));
const BNS_GET_NAME_INFO_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_GET_NAME_INFO_200_RESPONSE));
// const BNS_ERROR_400_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_ERROR_400_RESPONSE));
// const BNS_ERROR_404_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_ERROR_404_RESPONSE));
const BNS_FETCH_HISTORICAL_ZONEFILE_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_FETCH_HISTORICAL_ZONEFILE_200_RESPONSE));
const BNS_FETCH_FILEZONE_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_FETCH_FILEZONE_200_RESPONSE));
const BNS_NAMES_OWN_BY_ADDRESS_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_NAMES_OWN_BY_ADDRESS_200_RESPONSE));
const BNS_ALL_SUBDOMAINS_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_ALL_SUBDOMAINS_200_RESPONSE));
const BNS_SUBDOMAINS_AT_TRANSACTION_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_SUBDOMAINS_AT_TRANSACTION_200_RESPONSE));
const BNS_NAMES_200_RESPONSE_OBJECT = JSON.parse(JSON.stringify(BNS_NAMES_200_RESPONSE));


import { rest } from 'msw';
import {
  fetchNamespacePrice,
  fetchNamePrice,
  fetchNamespaces,
  fetchNamesFromNamespaces,
  fetchNames,
  fetchName,
  fetchNameHistory,
  fetchZoneFile,
  fetchHistoricalZoneFile,
  fetchNamesByAddress,
  fetchAllSubdomains,
  fetchSubdomainAtTransaction,
} from './fetchers';
import { v1Endpoint, v2Endpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

// /v2/prices/namespaces/{tld}
// /v2/prices/names/{name}
// /v1/namespaces
// /v1/namespaces/{tld}/names
// /v1/names
// /v1/names/{name}
// /v1/names/{name}/history
// /v1/names/{name}/zonefile
// /v1/names/{name}/zonefile/{zoneFileHash}
// /v1/addresses/{blockchain}/{address}
// /v1/subdomains
// /v1/subdomains/{txid}

const contractId = '1C56LYirKa3PFXFsvhSESgDy2acEHVAEt6';
const tld = 'muneeb.id';
const name = 'test';
const zoneFileHash = 'b100a68235244b012854a95f9114695679002af9';
const blockchain = 'bitcoin';
const address = '1QJQxDas5JhdiXhEbNS14iNjr8auFT96GP';
const txid = 'd04d708472ea3c147f50e43264efdb1535f71974053126dc4db67b3ac19d41fe';
const page = 3;

export const GET_BNS_MOCKS = [
  rest.get(v2Endpoint(HIRO_TESTNET_DEFAULT) + '/prices/namespaces/' + tld, (_req, res, ctx) => {
    return res(ctx.json(BNS_GET_NAMESPACE_PRICE_200_RESPONSE_OBJECT));
  }),

  rest.get(v2Endpoint(HIRO_TESTNET_DEFAULT) + '/prices/names/' + name, (_req, res, ctx) => {
    return res(ctx.json(BNS_GET_NAMES_PRICE_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/namespaces', (_req, res, ctx) => {
    return res(ctx.json(BNS_GET_ALL_NAMESPACES_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/namespaces/' + tld + '/names', (_req, res, ctx) => {
    return res(ctx.json(BNS_NAMES_200_RESPONSE_OBJECT));
  }),
  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/names', (_req, res, ctx) => {
    return res(ctx.json(BNS_NAMES_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/names/' + name, (_req, res, ctx) => {
    return res(ctx.json(BNS_GET_NAME_INFO_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/names/' + name + '/history', (_req, res, ctx) => {
    return res(ctx.json(BNS_FETCH_FILEZONE_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/names/' + name + '/zonefile', (_req, res, ctx) => {
    return res(ctx.json(BNS_FETCH_FILEZONE_200_RESPONSE_OBJECT));
  }),

  rest.get(
    v1Endpoint(HIRO_TESTNET_DEFAULT) + '/names/' + name + '/zonefile/' + zoneFileHash,
    (_req, res, ctx) => {
      return res(ctx.json(BNS_FETCH_HISTORICAL_ZONEFILE_200_RESPONSE_OBJECT));
    }
  ),

  rest.get(
    v1Endpoint(HIRO_TESTNET_DEFAULT) + '/addresses/' + blockchain + '/' + address,
    (_req, res, ctx) => {
      return res(ctx.json(BNS_NAMES_OWN_BY_ADDRESS_200_RESPONSE_OBJECT));
    }
  ),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/subdomains', (_req, res, ctx) => {
    return res(ctx.json(BNS_ALL_SUBDOMAINS_200_RESPONSE_OBJECT));
  }),

  rest.get(v1Endpoint(HIRO_TESTNET_DEFAULT) + '/subdomains/' + txid, (_req, res, ctx) => {
    return res(ctx.json(BNS_SUBDOMAINS_AT_TRANSACTION_200_RESPONSE_OBJECT));
  }),
];

// bns.fetchers.spec.ts
describe('bns fetchers', () => {
  const server = setupServer(...GET_BNS_MOCKS);
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

  test(fetchNamespacePrice.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, tld: tld };
    const data = await fetchNamespacePrice(args);
    expect(data).toEqual(BNS_GET_NAMESPACE_PRICE_200_RESPONSE_OBJECT);
  });

  test(fetchNamePrice.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, name: name };
    const data = await fetchNamePrice(args);
    expect(data).toEqual(BNS_GET_NAMES_PRICE_200_RESPONSE_OBJECT);
  });

  test(fetchNamespaces.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, contractId: contractId };
    const data = await fetchNamespaces(args);
    expect(data).toEqual(BNS_GET_ALL_NAMESPACES_200_RESPONSE_OBJECT);
  });

  test(fetchNamesFromNamespaces.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, tld: tld };
    const data = await fetchNamesFromNamespaces(args);
    expect(data).toEqual(BNS_NAMES_200_RESPONSE_OBJECT);
  });

  test(fetchNames.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, page: page };
    const data = await fetchNames(args);
    expect(data).toEqual(BNS_NAMES_200_RESPONSE_OBJECT);
  });

  test(fetchName.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, name: name };
    const data = await fetchName(args);
    expect(data).toEqual(BNS_GET_NAME_INFO_200_RESPONSE_OBJECT);
  });

  test(fetchNameHistory.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, name: name };
    const data = await fetchNameHistory(args);
    expect(data).toEqual(BNS_FETCH_FILEZONE_200_RESPONSE_OBJECT);
  });

  test(fetchZoneFile.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, name: name };
    const data = await fetchZoneFile(args);
    expect(data).toEqual(BNS_FETCH_FILEZONE_200_RESPONSE_OBJECT);
  });

  test(fetchHistoricalZoneFile.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, name: name, zoneFileHash: zoneFileHash };
    const data = await fetchHistoricalZoneFile(args);
    expect(data).toEqual(BNS_FETCH_HISTORICAL_ZONEFILE_200_RESPONSE_OBJECT);
  });

  test(fetchNamesByAddress.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, blockchain: blockchain, address: address };
    const data = await fetchNamesByAddress(args);
    expect(data).toEqual(BNS_NAMES_OWN_BY_ADDRESS_200_RESPONSE_OBJECT);
  });

  test(fetchAllSubdomains.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, page: page };
    const data = await fetchAllSubdomains(args);
    expect(data).toEqual(BNS_ALL_SUBDOMAINS_200_RESPONSE_OBJECT);
  });

  test(fetchSubdomainAtTransaction.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, txid: txid };
    const data = await fetchSubdomainAtTransaction(args);
    expect(data).toEqual(BNS_SUBDOMAINS_AT_TRANSACTION_200_RESPONSE_OBJECT);
  });
});
