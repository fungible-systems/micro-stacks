import { setupServer } from 'msw/node';
import * as FUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE from '../../../tests/mocks/api/tokens/FungibleTokensMetadataList200.json';
import * as NONFUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE from '../../../tests/mocks/api/tokens/NonFungibleTokensMetadataList200.json';
import * as NON_FUNGIBLE_TOKEN_METADATA_200_RESPONSE from '../../../tests/mocks/api/tokens/NonFungibleTokenMetadata200.json';
import * as FUNGIBLE_TOKEN_METADATA_200_RESPONSE from '../../../tests/mocks/api/tokens/FungibleTokenMetadata200.json';

// convert json modules to js objects
const FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(FUNGIBLE_TOKEN_METADATA_200_RESPONSE)
);
const NON_FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(NON_FUNGIBLE_TOKEN_METADATA_200_RESPONSE)
);
const FUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(FUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE)
);
const NONFUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(NONFUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE)
);

import { rest } from 'msw';
import {
  fetchFtMetadataList,
  fetchNftMetadataList,
  fetchNftMetadataForContractId,
  fetchFtMetadataForContractId,
} from './fetchers';
import { tokensEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

const contractId = '1C56LYirKa3PFXFsvhSESgDy2acEHVAEt6';

export const GET_TOKEN_MOCKS = [
  rest.get(tokensEndpoint(HIRO_TESTNET_DEFAULT) + '/ft/metadata', (_req, res, ctx) => {
    return res(ctx.json(FUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ));
  }),

  rest.get(tokensEndpoint(HIRO_TESTNET_DEFAULT) + '/nft/metadata', (_req, res, ctx) => {
    return res(ctx.json(NONFUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ));
  }),

  rest.get(
    tokensEndpoint(HIRO_TESTNET_DEFAULT) + '/' + contractId + '/nft/metadata',
    (_req, res, ctx) => {
      return res(ctx.json(NON_FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ));
    }
  ),

  rest.get(
    tokensEndpoint(HIRO_TESTNET_DEFAULT) + '/' + contractId + '/ft/metadata',
    (_req, res, ctx) => {
      return res(ctx.json(FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ));
    }
  ),
];

// tokens.fetchers.spec.ts
describe('tokens fetchers', () => {
  const server = setupServer(...GET_TOKEN_MOCKS);
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

  test(fetchFtMetadataList.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchFtMetadataList(args);
    expect(data).toEqual(FUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ);
  });

  test(fetchNftMetadataList.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT };
    const data = await fetchNftMetadataList(args);
    expect(data).toEqual(NONFUNGIBLE_TOKENS_METADATA_LIST_200_RESPONSE_OBJ);
  });

  test(fetchNftMetadataForContractId.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, contractId: contractId };
    const data = await fetchNftMetadataForContractId(args);
    expect(data).toEqual(NON_FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ);
  });

  test(fetchFtMetadataForContractId.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, contractId: contractId };
    const data = await fetchFtMetadataForContractId(args);
    expect(data).toEqual(FUNGIBLE_TOKEN_METADATA_200_RESPONSE_OBJ);
  });
});
