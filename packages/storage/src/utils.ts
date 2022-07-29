import { GaiaHubConfig } from 'micro-stacks/storage/gaia/types';

interface ListFilesResponse {
  entries: string[];
  page: null | string;
}

async function listFilesFetcher({
  gaiaHubConfig,
  prefix,
  pageToken,
  verbose,
  fetcher = fetch,
}: ListFilesOptions): Promise<ListFilesResponse> {
  try {
    const body = JSON.stringify({ page: pageToken, stat: verbose });
    const path = `${gaiaHubConfig!.server}/list-files/${gaiaHubConfig!.address}${
      !prefix ? '' : `/${prefix}`
    }`;
    const response = await fetcher(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${body.length}`,
        Authorization: `bearer ${gaiaHubConfig!.token}`,
      },
      body,
    });
    return (await response.json()) as ListFilesResponse;
  } catch (e) {}
  return {
    entries: [] as string[],
    page: null,
  } as ListFilesResponse;
}

interface ListFilesOptions {
  gaiaHubConfig: GaiaHubConfig;
  prefix?: string;
  pageToken?: string | null;
  verbose?: boolean;
  fetcher?: any;
}

export async function listFiles({
  gaiaHubConfig,
  prefix,
  pageToken = null,
  verbose,
  fetcher,
}: ListFilesOptions) {
  let isFetching = true;
  const entries: string[] = [];
  let nextPageToken: null | string = pageToken ?? null;

  while (isFetching) {
    const results: ListFilesResponse = await listFilesFetcher({
      pageToken: nextPageToken,
      gaiaHubConfig,
      verbose,
      prefix,
      fetcher,
    });

    if (results.entries.length) entries.push(...results.entries);
    if (results.page) nextPageToken = results.page;
    else isFetching = false;
  }
  return entries;
}

export function withJson(path: string) {
  if (path.endsWith('.json')) return path;
  return `${path}.json`;
}

export async function deleteFromGaiaHub(
  filename: string,
  gaiaHubConfig: GaiaHubConfig,
  fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<void> {
  const fetchFn = fetcher ?? fetch;
  const response = await fetchFn(
    `${gaiaHubConfig.server}/delete/${gaiaHubConfig.address}/${filename}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `bearer ${gaiaHubConfig.token}`,
      },
    }
  );
  if (!response.ok) {
    throw Error('Error deleting file from Gaia hub.');
  }
}

interface Cache<Value> {
  get: (key: string) => Value;
  set: (key: string, value: Value) => void;
  remove: (key: string) => void;
}

export const fetchWithEtagCache = async (
  input: RequestInfo,
  init: RequestInit = {},
  getCache: () => Cache<any>
): Promise<Response> => {
  const cache = getCache();
  const method = init?.method ?? 'GET';
  const isGet = method.toLowerCase() === 'get';
  // if it's anything other than get, return standard fetch
  if (!isGet) return fetch(input, init);
  // otherwise it's a GET
  const key = `${input}__etag`;
  const headers = new Headers(init?.headers);
  const cachedETag = cache.get(key);
  const shouldSetHeader = !headers.get('If-None-Match') && typeof cachedETag === 'string';
  // if we have a last-seen etag
  if (shouldSetHeader) headers.set('If-None-Match', cachedETag);
  const res = await fetch(input, { ...init, headers });
  const etag = res.headers.get('etag');
  // set the cache
  if (etag) cache.set(key, etag);

  if (etag && res.status === 200) {
    // clone the response for later
    cache.set(etag, res.clone());
  } else if (res.status === 304 && cachedETag) {
    // the API will not pass data, as such, we need the cached version
    const newRes = cache.get(cachedETag);
    if (newRes) return newRes.clone();
    else {
      // something went wrong, we should clear cache and fetch normally
      if (etag) cache.remove(etag);
      if (cachedETag) cache.remove(key);
      return fetchWithEtagCache(input, init, getCache);
    }
  }
  return res;
};
