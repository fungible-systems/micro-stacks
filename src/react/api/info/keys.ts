import { makeQueryKey } from 'jotai-query-toolkit';
import { WithHeight } from '../../types';
import { BaseListParams } from '../../../api/types';

export enum InfoClientKeys {
  CoreApiInfo = 'info/CoreApiInfo',
  Status = 'info/Status',
  NetworkBlockTimes = 'info/NetworkBlockTimes',
  NetworkBlockTime = 'info/NetworkBlockTime',
  StxSupply = 'info/StxSupply',
  StxSupplyPlain = 'info/StxSupplyPlain',
  StxSupplyCirculatingPlain = 'info/StxSupplyCirculatingPlain',
  StxSupplyLegacyFormat = 'info/StxSupplyLegacyFormat',
  Pox = 'info/Pox',
}

export const makeInfoClientKeys = {
  coreApiInfo: (params: [url: string]) => makeQueryKey(InfoClientKeys.CoreApiInfo, params),
  status: (params: [url: string]) => makeQueryKey(InfoClientKeys.Status, params),
  networkBlockTimes: (params: [url: string]) =>
    makeQueryKey(InfoClientKeys.NetworkBlockTimes, params),
  networkBlockTime: (params: [url: string, network: 'mainnet' | 'testnet']) =>
    makeQueryKey(InfoClientKeys.NetworkBlockTime, params),
  stxSupply: (params: [url: string, height: number]) =>
    makeQueryKey(InfoClientKeys.StxSupply, params),
  stxSupplyPlain: (params: [url: string]) => makeQueryKey(InfoClientKeys.StxSupplyPlain, params),
  stxSupplyCirculatingPlain: (params: [url: string]) =>
    makeQueryKey(InfoClientKeys.StxSupplyCirculatingPlain, params),
  stxSupplyLegacyFormat: (params: [url: string, height: number]) =>
    makeQueryKey(InfoClientKeys.StxSupplyLegacyFormat, params),
  pox: (params: [url: string]) => makeQueryKey(InfoClientKeys.Pox, params),
};
