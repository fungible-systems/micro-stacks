import { setupServer } from 'msw/node';
import * as ADDRESS_TRANSACTION_WITH_TRANSFERS_RESPONSE from '../../../tests/mocks/api/accounts/AddressTransactionWithTransfers.json';
import * as ADDRESS_NONCES_RESPONSE from '../../../tests/mocks/api/accounts/AddressNonces.json';
import * as ADDRESS_STX_INBOUND_LIST_RESPONSE from '../../../tests/mocks/api/accounts/AddressStxInboundListResponse.json';
import * as ADDRESS_NFT_LIST_RESPONSE from '../../../tests/mocks/api/accounts/AddressNftListResponse.json';
import * as ACCOUNT_DATA_RESPONSE from '../../../tests/mocks/api/accounts/AccountDataResponse.json';

import { rest } from 'msw';
import {
  fetchAccountTransactionWithTransfers,
  fetchAccountNonces,
  fetchAccountStxInbound,
  fetchAccountNftEvents,
  fetchAccountInfo,
} from './fetchers';

import {
  addressEndpoint,
  statusEndpoint,
  networkBlockTimesEndpoint,
  networkBlockTimeEndpoint,
  stxSupplyEndpoint,
} from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const principal = '1C56LYirKa3PFXFsvhSESgDy2acEHVAEt6';
const tx_id = '0x5e9f3933e358df6a73fec0d47ce3e1062c20812c129f5294e6f37a8d27c051d9';

export const GET_ACCOUNTS_MOCKS = [
  rest.get(
    `${addressEndpoint(HIRO_TESTNET_DEFAULT)}/${principal}/${tx_id}/transactions_with_transfers`,
    (_req, res, ctx) => {
      return res(ctx.json(ADDRESS_TRANSACTION_WITH_TRANSFERS_RESPONSE));
    }
  ),
  rest.get(`${addressEndpoint(HIRO_TESTNET_DEFAULT)}/${principal}/nonces`, (_req, res, ctx) => {
    return res(ctx.json(ADDRESS_NONCES_RESPONSE));
  }),
  rest.get(
    `${addressEndpoint(HIRO_TESTNET_DEFAULT)}/${principal}/stx_inbound`,
    (_req, res, ctx) => {
      return res(ctx.json(ADDRESS_STX_INBOUND_LIST_RESPONSE));
    }
  ),
  rest.get(`${addressEndpoint(HIRO_TESTNET_DEFAULT)}/${principal}/nft_events`, (_req, res, ctx) => {
    return res(ctx.json(ADDRESS_NFT_LIST_RESPONSE));
  }),
  rest.get(`${addressEndpoint(HIRO_TESTNET_DEFAULT)}/${principal}`, (_req, res, ctx) => {
    return res(ctx.json(ACCOUNT_DATA_RESPONSE));
  }),
];

// accounts.fetchers.spec.ts
describe('accounts fetchers', () => {
  const server = setupServer(...GET_ACCOUNTS_MOCKS);
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

  test(fetchAccountTransactionWithTransfers.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, principal, tx_id };
    const data = await fetchAccountTransactionWithTransfers(args);
    expect(data).toEqual(ADDRESS_TRANSACTION_WITH_TRANSFERS_RESPONSE);
  });

  test(fetchAccountNonces.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, principal };
    const data = await fetchAccountNonces(args);
    expect(data).toEqual(ADDRESS_NONCES_RESPONSE);
  });

  test(fetchAccountStxInbound.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, principal };
    const data = await fetchAccountStxInbound(args);
    expect(data).toEqual(ADDRESS_STX_INBOUND_LIST_RESPONSE);
  });

  test(fetchAccountNftEvents.name, async () => {
    const network: 'mainnet' | 'testnet' = 'testnet';
    const args = { url: HIRO_TESTNET_DEFAULT, principal };
    const data = await fetchAccountNftEvents(args);
    expect(data).toEqual(ADDRESS_NFT_LIST_RESPONSE);
  });

  test(fetchAccountInfo.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, principal };
    const data = await fetchAccountInfo(args);
    expect(data).toEqual(ACCOUNT_DATA_RESPONSE);
  });
});
