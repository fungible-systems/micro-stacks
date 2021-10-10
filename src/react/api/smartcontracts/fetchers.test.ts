import { setupServer } from 'msw/node';

import * as ABSTRACT_TRANSACTION_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/AbstractTransaction200.json';
import * as CONTRACT_INTERFACE_RESPONSE_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/ContractInterfaceResponse200.json';
import * as TRANSACTION_EVENT_SMART_CONTRACT_LOG_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventSmartContractLog200.json';
//import * as TRANSACTION_EVENT_STX_LOCK_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventStxLock200.json';
//import * as TRANSACTION_EVENT_STX_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventStxAsset200.json';
//import * as TRANSACTION_EVENT_FUNGIBLE_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventFungibleAsset200.json';
//import * as TRANSACTION_EVENT_NON_FUNGIBLE_ASSET_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/TransactionEventNonFungibleAsset200.json';
import * as CONTRACT_SOURCE_200_RESPONSE from '../../../../tests/mocks/api/smartcontracts/ContractSourceResponse200.json';

import { rest } from 'msw';
import {
  fetchContractById,
  fetchContractEventsById,
  fetchContractInterface,
  fetchContractSource,
} from './fetchers';
import { contractEndpoint, contractsEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const contract_id = 'STJTXEJPJPPVDNA9B052NSRRBGQCFNKVS178VGH1.hello_world';
const [contract_address, contract_name] = contract_id.split('.');
const tip = 'b1807a2d3f7f8c7922f7c1d60d7c34145ade05d789640dc7dc9ec1021e07bb54';
const proof = 0x0000001104060000001;
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
  rest.get(
    contractsEndpoint(HIRO_TESTNET_DEFAULT) + '/source/' + contract_address + '/' + contract_name,
    (_req, res, ctx) => {
      return res(ctx.json(CONTRACT_SOURCE_200_RESPONSE));
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
    jest.resetModules();
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
});
