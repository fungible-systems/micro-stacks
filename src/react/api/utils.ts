import {
  MempoolTransaction,
  Transaction,
  TransactionType,
} from '@stacks/stacks-blockchain-api-types';
import { fetchPrivate } from 'micro-stacks/common';

export const isNumber = (value: number | string): value is number => typeof value === 'number';

export function parseTxTypeStrings(values: string[]): TransactionType[] {
  return values.map(v => {
    switch (v) {
      case 'contract_call':
      case 'smart_contract':
      case 'token_transfer':
      case 'coinbase':
      case 'poison_microblock':
        return v;
      default:
        throw new Error(`Unexpected tx type: ${JSON.stringify(v)}`);
    }
  });
}

export const validateTxTypes = (typeQuery: TransactionType[] | TransactionType) => {
  let txTypeFilter: TransactionType[];
  if (Array.isArray(typeQuery)) {
    txTypeFilter = parseTxTypeStrings(typeQuery as string[]);
  } else if (typeof typeQuery === 'string') {
    txTypeFilter = parseTxTypeStrings([typeQuery]);
  } else if (typeQuery) {
    throw new Error(`Unexpected tx type query value: ${JSON.stringify(typeQuery)}`);
  } else {
    txTypeFilter = [];
  }
  return txTypeFilter;
};

export const generateQueryStringFromArray = <T>(key: string, values?: T[]) => {
  if (values?.length) {
    return `${values
      .map(
        (value, index) =>
          `${index > 0 ? encodeURIComponent(`${key}[]`) : ''}=${encodeURIComponent(
            value as unknown as string
          )}`
      )
      .join('&')}`;
  }
  return '';
};
export const generateUrl = <Value = unknown>(
  baseUrl: string,
  params: { [key: string]: string[] | string | number | undefined }
): string => {
  const url = new URL(baseUrl);
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (!value) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      return url.searchParams.set(`${key}[]`, generateQueryStringFromArray<string>(key, value));
    }
    if (isNumber(value)) {
      return url.searchParams.set(key, String(value));
    } else {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
};

export function v2Endpoint(url: string) {
  return `${url}/v2`;
}

export function extendedEndpoint(url: string) {
  return `${url}/extended/v1`;
}

export function statusEndpoint(url: string) {
  return `${extendedEndpoint(url)}/status`;
}

export function addressEndpoint(url: string) {
  return `${extendedEndpoint(url)}/address`;
}

export function txEndpoint(url: string) {
  return `${extendedEndpoint(url)}/tx`;
}

export function infoEndpoint(url: string) {
  return `${v2Endpoint(url)}/info`;
}

export function networkBlockTimesEndpoint(url: string) {
  return `${infoEndpoint(url)}/network_block_times`;
}

export function networkBlockTimeEndpoint(url: string) {
  return `${infoEndpoint(url)}/network_block_time`;
}

export function txMempoolEndpoint(url: string) {
  return `${txEndpoint(url)}/mempool`;
}

export async function fetchJson<T>(path: string) {
  const res = await fetchPrivate(path);
  return (await res.json()) as T;
}

export function getNextPageParam(options: { limit: number; offset: number; total: number }) {
  if (!options) return 0;
  const { limit, offset, total } = options;
  const sum = offset + limit;
  const delta = total - sum;
  const isAtEnd = delta === 0 || Math.sign(delta) === -1;
  if (Math.abs(delta) === sum || isAtEnd) return undefined;
  return sum;
}
