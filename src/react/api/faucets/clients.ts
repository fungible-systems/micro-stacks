import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import { fetchGetStxTokens, fetchGetBtcTokens } from '../../../api/faucets/fetchers';
import { FaucetsClientKeys } from './keys';

import type { NetworkWithAddressStacking } from '../../types';
import type { RunFaucetResponse } from '@stacks/stacks-blockchain-api-types';

export const getStxTokensClientAtom = atomFamilyWithQuery<
  NetworkWithAddressStacking,
  RunFaucetResponse
>(FaucetsClientKeys.GetStxTokens, async function queryFn(get, [url, address, stacking]) {
  return fetchGetStxTokens({ url, address, stacking });
});

export const getBtcTokensClientAtom = atomFamilyWithQuery<
  NetworkWithAddressStacking,
  RunFaucetResponse
>(FaucetsClientKeys.GetBtcTokens, async function queryFn(get, [url, address]) {
  return fetchGetBtcTokens({ url, address });
});
