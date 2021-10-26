import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import { fetchSearch } from '../../../api/search/fetchers';
import { SearchClientKeys } from './keys';

import type { IdWithNetwork } from '../../types';
import type { SearchErrorResult, SearchSuccessResult } from '@stacks/stacks-blockchain-api-types';

export const searchClientAtom = atomFamilyWithQuery<
  IdWithNetwork,
  SearchErrorResult | SearchSuccessResult
>(SearchClientKeys.Search, async function queryFn(get, [id, url]) {
  return fetchSearch({ url, id });
});
