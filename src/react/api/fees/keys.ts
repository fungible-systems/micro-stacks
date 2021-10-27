import { makeQueryKey } from 'jotai-query-toolkit';
import { NetworkWithLimitOffset } from '../../types';

export enum FeesClientKeys {
  Fees = 'fees/Fees',
}

export const makeFeesClientKeys = {
  fees: (params: NetworkWithLimitOffset) => makeQueryKey(FeesClientKeys.Fees, params),
};
