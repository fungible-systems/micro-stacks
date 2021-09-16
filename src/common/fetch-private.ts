const isClientSide = typeof window !== 'undefined';

const DEFAULT_FETCH_OPTIONS: RequestInit = isClientSide
  ? {
      referrer: 'no-referrer',
      referrerPolicy: 'no-referrer',
    }
  : {};

export async function fetchPrivate(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { ...DEFAULT_FETCH_OPTIONS, ...init });
}
