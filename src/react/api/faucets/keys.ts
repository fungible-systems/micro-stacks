import { makeQueryKey } from 'jotai-query-toolkit';
import { NetworkWithAddressStacking } from '../../types';

export enum FaucetsClientKeys {
  GetStxTokens = 'faucets/GetStxTokens',
  GetBtcTokens = 'faucets/GetBtcTokens',
}

export const makeFaucetsClientKeys = {
  getStxTokens: (params: NetworkWithAddressStacking) =>
    makeQueryKey(FaucetsClientKeys.GetStxTokens, params),
  getBtcTokens: (params: NetworkWithAddressStacking) =>
    makeQueryKey(FaucetsClientKeys.GetBtcTokens, params),
};
