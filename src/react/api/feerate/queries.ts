import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeFeerateClientKeys } from './keys';
import { fetchFeerate } from '../../../api/feerate/fetchers';

export interface FeerateQueryParams {
  url: string;
  transaction: string;
}

export function feerateQuery(params: FeerateQueryParams): Queries[number] {
  const { url, transaction } = params;
  return [
    makeFeerateClientKeys.feerate([url, transaction]),
    async () =>
      fetchFeerate({
        url,
        transaction,
      }),
  ];
}
