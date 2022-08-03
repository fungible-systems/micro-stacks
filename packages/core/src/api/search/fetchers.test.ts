import { setupServer } from 'msw/node';
import * as SEARCH_SUCCESS_200_RESPONSE from '../../../tests/mocks/api/search/SearchSuccessResult200.json';
import * as SEARCH_ERROR_404_RESPONSE from '../../../tests/mocks/api/search/SearchErrorResult404.json';

import { rest } from 'msw';
import { fetchSearch } from './fetchers';
import { searchEndpoint } from '../utils';
import { HIRO_TESTNET_DEFAULT } from 'micro-stacks/network';

// convert json modules to js objects
const SEARCH_SUCCESS_200_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(SEARCH_SUCCESS_200_RESPONSE)
);
const SEARCH_ERROR_404_RESPONSE_OBJ = JSON.parse(
  JSON.stringify(SEARCH_ERROR_404_RESPONSE)
);

const id = '1C56LYirKa3PFXFsvhSESgDy2acEHVAEt6';
const id_not_found = 'nothing';

export const GET_SEARCH_MOCKS = [
  rest.get(searchEndpoint(HIRO_TESTNET_DEFAULT) + '/' + id, (_req, res, ctx) => {
    return res(ctx.json(SEARCH_SUCCESS_200_RESPONSE_OBJ));
  }),

  rest.get(searchEndpoint(HIRO_TESTNET_DEFAULT) + '/' + id_not_found, (_req, res, ctx) => {
    return res(ctx.json(SEARCH_ERROR_404_RESPONSE_OBJ));
  }),
];

// search.fetchers.spec.ts
describe('burnchain fetchers', () => {
  const server = setupServer(...GET_SEARCH_MOCKS);
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

  test(fetchSearch.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, id: id };
    const data = await fetchSearch(args);
    expect(data).toEqual(SEARCH_SUCCESS_200_RESPONSE_OBJ);
  });

  test(fetchSearch.name, async () => {
    const args = { url: HIRO_TESTNET_DEFAULT, id: id_not_found };
    const data = await fetchSearch(args);
    expect(data).toEqual(SEARCH_ERROR_404_RESPONSE_OBJ);
  });
});
