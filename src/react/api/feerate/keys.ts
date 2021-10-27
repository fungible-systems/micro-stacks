import { makeQueryKey } from 'jotai-query-toolkit';
import { NetworkWithTransaction } from '../../types';

export enum FeerateClientKeys {
  Feerate = 'feerate/Feerate',
}

export const makeFeerateClientKeys = {
  feerate: (params: NetworkWithTransaction) => makeQueryKey(FeerateClientKeys.Feerate, params),
};
