import { fetchPrivate } from 'micro-stacks/common';
import { getBlockstackErrorFromResponse } from '../gaia/errors';
import { GaiaHubConfig } from 'micro-stacks/storage';

/**
 * @param filename
 * @param gaiaHubConfig
 */
export async function deleteFromGaiaHub(path: string, gaiaHubConfig: GaiaHubConfig): Promise<void> {
  const response = await fetchPrivate(
    `${gaiaHubConfig.server}/delete/${gaiaHubConfig.address}/${path}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `bearer ${gaiaHubConfig.token}`,
      },
    }
  );
  if (!response.ok) {
    throw await getBlockstackErrorFromResponse(
      response,
      'Error deleting file from Gaia hub.',
      gaiaHubConfig
    );
  }
}
