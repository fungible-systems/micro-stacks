import { Queries } from 'jotai-query-toolkit/nextjs';
import { makeInfoClientKeys } from './keys';
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
import type { WithHeight } from '../../types';
import { BaseListParams } from '../../../api/types';

export function coreApiInfoQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.coreApiInfo([url]),
    async () =>
      fetchCoreApiInfo({
        url: url,
      }),
  ];
}

export function statusQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.status([url]),
    async () =>
      fetchStatus({
        url: url,
      }),
  ];
}

export function networkBlockTimesQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.networkBlockTimes([url]),
    async () =>
      fetchNetworkBlockTimes({
        url: url,
      }),
  ];
}

export function networkBlockTimeQuery(params: {
  url: string;
  network: 'mainnet' | 'testnet';
}): Queries[number] {
  const { url, network } = params;
  return [
    makeInfoClientKeys.networkBlockTime([url, network]),
    async () =>
      fetchNetworkBlockTime({
        url,
        network,
      }),
  ];
}

export function stxSupplyQuery(params: { url: string; height: number }): Queries[number] {
  const { url, height } = params;
  return [
    makeInfoClientKeys.stxSupply([url, height]),
    async () =>
      fetchStxSupply({
        url,
        height,
      }),
  ];
}

export function stxSupplyPlainQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.stxSupplyPlain([url]),
    async () =>
      fetchStxSupplyPlain({
        url,
      }),
  ];
}

export function stxSupplyCirculatingPlainQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.stxSupplyCirculatingPlain([url]),
    async () =>
      fetchStxSupplyCirculatingPlain({
        url: url,
      }),
  ];
}

export function stxSupplyLegacyFormatQuery(params: {
  url: string;
  height: number;
}): Queries[number] {
  const { url, height } = params;
  return [
    makeInfoClientKeys.stxSupplyLegacyFormat([url, height]),
    async () =>
      fetchStxSupplyLegacyFormat({
        url,
        height,
      }),
  ];
}

export function poxQuery(params: { url: string }): Queries[number] {
  const { url } = params;
  return [
    makeInfoClientKeys.pox([url]),
    async () =>
      fetchPox({
        url,
      }),
  ];
}
