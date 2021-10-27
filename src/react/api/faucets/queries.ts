import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeFaucetsClientKeys } from './keys';
import { fetchGetStxTokens, fetchGetBtcTokens } from '../../../api/faucets/fetchers';

export interface FaucetsQueryParams {
  networkUrl: string;
  address: string;
  stacking?: boolean;
}

export function getStxTokensQuery(params: FaucetsQueryParams): Queries[number] {
  const { networkUrl, address, stacking } = params;
  return [
    makeFaucetsClientKeys.getStxTokens([networkUrl, address, stacking]),
    async () =>
      fetchGetStxTokens({
        url: networkUrl,
        address,
        stacking,
      }),
  ];
}

export function getBtcTokensQuery(params: FaucetsQueryParams): Queries[number] {
  const { networkUrl, address } = params;
  return [
    makeFaucetsClientKeys.getBtcTokens([networkUrl, address]),
    async () =>
      fetchGetBtcTokens({
        url: networkUrl,
        address,
      }),
  ];
}
