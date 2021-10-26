import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeSearchClientKeys } from './keys';
import { fetchSearch } from '../../../api/search/fetchers';

export interface SearchQueryParams {
  id: string;
  networkUrl: string;
}

export function searchQuery(params: SearchQueryParams): Queries[number] {
  const { id, networkUrl } = params;
  return [
    makeSearchClientKeys.search([id, networkUrl]),
    async () =>
      fetchSearch({
        url: networkUrl,
        id,
      }),
  ];
}
