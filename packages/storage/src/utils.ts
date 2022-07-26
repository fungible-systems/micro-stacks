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
  gaiaHubConfig: GaiaHubConfig
): Promise<void> {
  const response = await fetch(
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
