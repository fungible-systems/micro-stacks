import { setupServer } from 'msw/node';

import * as ABSTRACT_TRANSACTION_200_RESPONSE from '../../../tests/mocks/api/smartcontracts/AbstractTransaction200.json';
import * as CONTRACT_INTERFACE_RESPONSE_200_RESPONSE from '../../../tests/mocks/api/smartcontracts/ContractInterfaceResponse200.json';
import * as TRANSACTION_EVENT_SMART_CONTRACT_LOG_200_RESPONSE from '../../../tests/mocks/api/smartcontracts/TransactionEventSmartContractLog200.json';
//import * as TRANSACTION_EVENT_STX_LOCK_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventStxLock200.json';
//import * as TRANSACTION_EVENT_STX_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventStxAsset200.json';
//import * as TRANSACTION_EVENT_FUNGIBLE_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventFungibleAsset200.json';
//import * as TRANSACTION_EVENT_NON_FUNGIBLE_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventNonFungibleAsset200.json';
import * as CONTRACT_SOURCE_200_RESPONSE from '../../../tests/mocks/api/smartcontracts/ContractSourceResponse200.json';

const CONTRACT_DATA_MAP_ENTRY = {
  data: '0x0a0c000000010a6d6f6e737465722d69640100000000000000000000000000000001',
  proof: '0x123',
};
import { rest } from 'msw';
import {
  fetchContractById,
  fetchContractDataMapEntry,
  fetchContractEventsById,
  fetchContractInterface,
  fetchContractSource,
} from './fetchers';
import { contractEndpoint, contractsEndpoint, v2Endpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const contract_id = 'STJTXEJPJPPVDNA9B052NSRRBGQCFNKVS178VGH1.hello_world';
const functionName = 'hi';
// const senderAddress = 'STJTXEJPJPPVDNA9B052NSRRBGQCFNKVS178VGH1';
// const functionArgs: ClarityValue[] = [];
const [contract_address, contract_name] = contract_id.split('.');
const tip = 'b1807a2d3f7f8c7922f7c1d60d7c34145ade05d789640dc7dc9ec1021e07bb54';
const proof = 0x0000001104060000001;
const mapName = 'mapname';
const lookup_key = 'lookup_key';

export const GET_SMARTCONTRACTS_MOCKS = [
  rest.get(contractEndpoint(HIRO_TESTNET_DEFAULT) + '/' + contract_id, (_req, res, ctx) => {
    return res(ctx.json(ABSTRACT_TRANSACTION_200_RESPONSE));
  }),
  rest.get(
    contractEndpoint(HIRO_TESTNET_DEFAULT) + '/' + contract_id + '/events',
    (_req, res, ctx) => {
      return res(ctx.json(TRANSACTION_EVENT_SMART_CONTRACT_LOG_200_RESPONSE));
    }
  ),
  rest.get(
    contractsEndpoint(HIRO_TESTNET_DEFAULT) +
      '/interface/' +
      contract_address +
      '/' +
      contract_name,
    (_req, res, ctx) => {
      return res(ctx.json(CONTRACT_INTERFACE_RESPONSE_200_RESPONSE));
    }
  ),
  rest.post(
    `${v2Endpoint(HIRO_TESTNET_DEFAULT)}/map_entry/${contract_address}/${contract_name}/${mapName}`,
    (_req, res, ctx) => {
      return res(ctx.json(CONTRACT_DATA_MAP_ENTRY));
    }
  ),
  rest.get(
    contractsEndpoint(HIRO_TESTNET_DEFAULT) + '/source/' + contract_address + '/' + contract_name,
    (_req, res, ctx) => {
      return res(ctx.json(CONTRACT_SOURCE_200_RESPONSE));
    }
  ),
  rest.post(
    `${contractsEndpoint(
      HIRO_TESTNET_DEFAULT
    )}/call-read/${contract_address}/${contract_name}/${functionName}`,
    (_req, res, ctx) => {
      return res(ctx.json({ body: null }));
    }
  ),
];

// smartcontracts.fetchers.spec.ts
describe('smartcontracts fetchers', () => {
  const server = setupServer(...GET_SMARTCONTRACTS_MOCKS);
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

  test(fetchContractById.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, contract_id: contract_id, unanchored: false };
    const data = await fetchContractById(args);
    expect(data).toEqual(ABSTRACT_TRANSACTION_200_RESPONSE);
  });

  test(fetchContractEventsById.name, async () => {
    const args = {
      url: HIRO_TESTNET_DEFAULT,
      limit: 0,
      offset: 0,
      unanchored: false,
      contract_id: contract_id,
    };
    const data = await fetchContractEventsById(args);
    expect(data).toEqual(TRANSACTION_EVENT_SMART_CONTRACT_LOG_200_RESPONSE);
  });

  test(fetchContractInterface.name, async () => {
    const args = {
      url: HIRO_TESTNET_DEFAULT,
      contract_address: contract_address,
      contract_name: contract_name,
      tip: tip,
    };
    const data = await fetchContractInterface(args);
    expect(data).toEqual(CONTRACT_INTERFACE_RESPONSE_200_RESPONSE);
  });

  test(fetchContractDataMapEntry.name, async () => {
    const args = {
      url: HIRO_TESTNET_DEFAULT,
      contract_name: contract_name,
      contract_address: contract_address,
      map_name: mapName,
      proof: proof,
      tip: tip,
      lookup_key: lookup_key,
    };
    const data = await fetchContractDataMapEntry(args);
    expect(data).toEqual(CONTRACT_DATA_MAP_ENTRY);
  });

  test(fetchContractSource.name, async () => {
    const args = {
      url: HIRO_TESTNET_DEFAULT,
      contract_address: contract_address,
      contract_name: contract_name,
      proof: proof,
      tip: tip,
    };
    const data = await fetchContractSource(args);
    expect(data).toEqual(CONTRACT_SOURCE_200_RESPONSE);
  });

  // TODO: the spec returns 'null'
  // test(callReadOnlyFunction.name, async () => {
  //   const args = {
  //     url: HIRO_TESTNET_DEFAULT,
  //     contractName: contract_name,
  //     contractAddress: contract_address,
  //     functionName: functionName,
  //     functionArgs: functionArgs,
  //     senderAddress: senderAddress,
  //   };
  //   const data = await callReadOnlyFunction(args);
  //   expect(data).toEqual({ body: null });
  // });
});
