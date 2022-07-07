import { GaiaHubConfig } from 'micro-stacks/storage';
import { deleteFromGaiaHub } from './delete-from-gaia-hub';
import { SIGNATURE_FILE_SUFFIX } from '../common/constants';

/**
 * Deletes the specified file from the app's data store.
 * @param path - The path to the file to delete.
 * @param options - options object.
 * @param options.wasSigned - Set to true if the file was originally signed
 * in order for the corresponding signature file to also be deleted.
 * @returns Resolves when the file has been removed or rejects with an error.
 */

export async function deleteFile(
  path: string,
  options: {
    wasSigned?: boolean;
    gaiaHubConfig: GaiaHubConfig;
  }
) {
  const { gaiaHubConfig, wasSigned } = options;
  const promises: Promise<void>[] = [deleteFromGaiaHub(path, gaiaHubConfig)];
  // If signed, delete both the content file and the .sig file
  if (wasSigned) promises.push(deleteFromGaiaHub(`${path}${SIGNATURE_FILE_SUFFIX}`, gaiaHubConfig));
  await Promise.all(promises);
}
