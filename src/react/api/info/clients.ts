import { atomFamilyWithQuery } from 'jotai-query-toolkit';

import {
  fetchCoreApiInfo,
  fetchStatus,
  fetchNetworkBlockTimes,
  fetchNetworkBlockTime,
  fetchStxSupply,
  fetchStxSupplyPlain,
  fetchStxSupplyCirculatingPlain,
  fetchStxSupplyLegacyFormat,
  fetchPox,
} from '../../../api/info/fetchers';
import { InfoClientKeys } from './keys';
import type { WithHeight } from '../../types';
import { BaseListParams } from '../../../api/types';

import type {
  CoreNodeInfoResponse,
  ServerStatusResponse,
  NetworkBlockTimesResponse,
  NetworkBlockTimeResponse,
  GetStxSupplyResponse,
  GetStxTotalSupplyPlainResponse,
  GetStxCirculatingSupplyPlainResponse,
  GetStxSupplyLegacyFormatResponse,
  CoreNodePoxResponse,
} from '@stacks/stacks-blockchain-api-types';

export const coreApiInfoClientAtom = atomFamilyWithQuery<[url: string], CoreNodeInfoResponse>(
  InfoClientKeys.CoreApiInfo,
  async function queryFn(get, [url]) {
    return fetchCoreApiInfo({ url });
  }
);

export const statusClientAtom = atomFamilyWithQuery<[url: string], ServerStatusResponse>(
  InfoClientKeys.Status,
  async function queryFn(get, [url]) {
    return fetchStatus({ url });
  }
);

export const networkBlockTimesClientAtom = atomFamilyWithQuery<
  [url: string],
  NetworkBlockTimesResponse
>(InfoClientKeys.NetworkBlockTimes, async function queryFn(get, [url]) {
  return fetchNetworkBlockTimes({ url });
});

export const networkBlockTimeClientAtom = atomFamilyWithQuery<
  [url: string, network: 'mainnet' | 'testnet'],
  NetworkBlockTimeResponse
>(InfoClientKeys.NetworkBlockTime, async function queryFn(get, [url, network]) {
  return fetchNetworkBlockTime({ url, network });
});

export const stxSupplyClientAtom = atomFamilyWithQuery<
  [url: string, height: number],
  GetStxSupplyResponse
>(InfoClientKeys.StxSupply, async function queryFn(get, [url, height]) {
  return fetchStxSupply({ url, height });
});

export const stxSupplyPlainClientAtom = atomFamilyWithQuery<
  [url: string, network: 'mainnet' | 'testnet'],
  GetStxTotalSupplyPlainResponse
>(InfoClientKeys.StxSupplyPlain, async function queryFn(get, [url]) {
  return fetchStxSupplyPlain({ url });
});

export const stxSupplyCirculatingPlainClientAtom = atomFamilyWithQuery<
  [url: string, network: 'mainnet' | 'testnet'],
  GetStxCirculatingSupplyPlainResponse
>(InfoClientKeys.StxSupplyCirculatingPlain, async function queryFn(get, [url]) {
  return fetchStxSupplyCirculatingPlain({ url });
});

export const stxSupplyLegacyFormatClientAtom = atomFamilyWithQuery<
  [url: string, height: number],
  GetStxSupplyLegacyFormatResponse
>(InfoClientKeys.StxSupplyLegacyFormat, async function queryFn(get, [url, height]) {
  return fetchStxSupplyLegacyFormat({ url, height });
});

export const poxClientAtom = atomFamilyWithQuery<[url: string], CoreNodePoxResponse>(
  InfoClientKeys.Pox,
  async function queryFn(get, [url]) {
    return fetchPox({ url });
  }
);
