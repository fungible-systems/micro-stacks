import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeFeesClientKeys } from './keys';
import { fetchFees } from '../../../api/fees/fetchers';

export interface FeesQueryParams {
  url: string;
}

export function feerateQuery(params: FeesQueryParams): Queries[number] {
  const { url } = params;
  return [
    makeFeesClientKeys.fees([url]),
    async () =>
      fetchFees({
        url,
      }),
  ];
}
