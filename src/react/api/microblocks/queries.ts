import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeMicroblocksClientKeys } from './keys';
import {
  fetchMicroblocks,
  fetchMicroblock,
  fetchMicroblocksUnanchoredTransactions,
} from '../../../api/microblocks/fetchers';

export interface MicroblocksQueryParams {
  networkUrl: string;
  limit?: number;
  offset?: number;
}

export interface MicroblockQueryParams {
  networkUrl: string;
  hash: string;
}

export interface MicroblocksUnanchoredTransactionsQueryParams {
  networkUrl: string;
}

export function microblocksQuery(params: MicroblocksQueryParams): Queries[number] {
  const { networkUrl, limit, offset } = params;
  return [
    makeMicroblocksClientKeys.microblocks([networkUrl, limit, offset]),
    async () =>
      fetchMicroblocks({
        url: networkUrl,
        limit,
        offset,
      }),
  ];
}

export function microblockQuery(params: MicroblockQueryParams): Queries[number] {
  const { networkUrl, hash } = params;
  return [
    makeMicroblocksClientKeys.microblock([networkUrl, hash]),
    async () =>
      fetchMicroblock({
        url: networkUrl,
        hash,
      }),
  ];
}

export function microblocksUnanchoredTransactionsQuery(
  params: MicroblocksUnanchoredTransactionsQueryParams
): Queries[number] {
  const { networkUrl } = params;
  return [
    makeMicroblocksClientKeys.microblocksUnanchoredTransactions([networkUrl]),
    async () =>
      fetchMicroblocksUnanchoredTransactions({
        url: networkUrl,
      }),
  ];
}
