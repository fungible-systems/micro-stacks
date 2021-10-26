import { makeQueryKey } from 'jotai-query-toolkit';
import { IdWithNetwork } from '../../types';

export enum SearchClientKeys {
  Search = 'search/Search',
}

export const makeSearchClientKeys = {
  search: (params: IdWithNetwork) => makeQueryKey(SearchClientKeys.Search, params),
};
