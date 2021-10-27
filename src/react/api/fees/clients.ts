import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import { fetchFees } from '../../../api/fees/fetchers';
import { FeesClientKeys } from './keys';

import type { NetworkWithLimitOffset } from '../../types';
import type { CoreNodeFeeResponse } from '@stacks/stacks-blockchain-api-types';

export const feesClientAtom = atomFamilyWithQuery<NetworkWithLimitOffset, CoreNodeFeeResponse>(
  FeesClientKeys.Fees,
  async function queryFn(get, [url]) {
    return fetchFees({ url });
  }
);
