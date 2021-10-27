import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import { fetchFeerate } from '../../../api/feerate/fetchers';
import { FeerateClientKeys } from './keys';

import type { NetworkWithTransaction } from '../../types';
import type { FeeRate } from '@stacks/stacks-blockchain-api-types';

export const feerateClientAtom = atomFamilyWithQuery<NetworkWithTransaction, FeeRate>(
  FeerateClientKeys.Feerate,
  async function queryFn(get, [url, transaction]) {
    return fetchFeerate({ url, transaction });
  }
);
