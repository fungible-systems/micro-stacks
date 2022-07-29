import type { GaiaHubConfig } from './types';
import { getBlockstackErrorFromResponse } from './errors';
import { fetchPrivate } from 'micro-stacks/common';
import { FetcherFn } from '../common/types';

interface UploadToGaiaHub {
  filename: string;
  contents: Blob | Uint8Array | ArrayBufferView | string;
  hubConfig: GaiaHubConfig;
  contentType?: string;
  fetcher?: FetcherFn;
}

export async function uploadToGaiaHub(options: UploadToGaiaHub): Promise<any> {
  const {
    filename,
    contents,
    hubConfig,
    contentType = 'application/octet-stream',
    fetcher = fetchPrivate,
  } = options;
  const headers: { [key: string]: string } = {
    'Content-Type': contentType,
    Authorization: `bearer ${hubConfig.token}`,
  };

  const response = await fetcher(`${hubConfig.server}/store/${hubConfig.address}/${filename}`, {
    method: 'POST',
    headers,
    body: contents,
  });

  if (!response.ok) {
    throw await getBlockstackErrorFromResponse(
      response,
      'Error when uploading to Gaia hub.',
      hubConfig
    );
  }
  const responseText = await response.text();
  return JSON.parse(responseText);
}

/**
 *
 * @param filename
 * @param hubConfig
 *
 * @ignore
 */
export function getFullReadUrl(filename: string, hubConfig: GaiaHubConfig): string {
  return `${hubConfig.url_prefix}${hubConfig.address}/${filename}`;
}
