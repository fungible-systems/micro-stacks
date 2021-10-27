import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchMicroblocks,
  fetchMicroblock,
  fetchMicroblocksUnanchoredTransactions,
} from '../../../api/microblocks/fetchers';
import { MicroblocksClientKeys } from './keys';

import type { NetworkWithLimitOffset, NetworkWithBlockHash, WithNetwork } from '../../types';
import type {
  MicroblockListResponse,
  Microblock,
  UnanchoredTransactionListResponse,
} from '@stacks/stacks-blockchain-api-types';

export const blocksClientAtom = atomFamilyWithQuery<NetworkWithLimitOffset, MicroblockListResponse>(
  MicroblocksClientKeys.Microblocks,
  async function queryFn(get, [url, limit, offset]) {
    return fetchMicroblocks({ url, limit, offset });
  }
);

export const blockClientAtom = atomFamilyWithQuery<NetworkWithBlockHash, Microblock>(
  MicroblocksClientKeys.Microblock,
  async function queryFn(get, [url, hash]) {
    return fetchMicroblock({ url, hash });
  }
);

export const microblockUnanchoredTransactionsClientAtom = atomFamilyWithQuery<
  WithNetwork,
  UnanchoredTransactionListResponse
>(MicroblocksClientKeys.MicroblocksUnanchoredTransactions, async function queryFn(get, [url]) {
  return fetchMicroblocksUnanchoredTransactions({ url });
});
