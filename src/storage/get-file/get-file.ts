import { DEFAULT_ZONEFILE_LOOKUP_URL } from '../common/constants';
import { handleSignedEncryptedContents } from './sign';
import { getFileContents, getFileSignedUnencrypted } from './getters';

import { decryptContent } from 'micro-stacks/crypto';
import { getGlobalObject } from 'micro-stacks/common';

import type { GaiaHubConfig } from '../gaia/types';
import type { GetFileOptions } from '../common/types';

export async function getFile(path: string, getFileOptions: GetFileOptions) {
  const options: GetFileOptions = {
    decrypt: true,
    verify: false,
    app: getGlobalObject('location', { returnEmptyObject: true })!.origin,
    zoneFileLookupURL: DEFAULT_ZONEFILE_LOOKUP_URL,
    ...getFileOptions,
  };

  // in the case of signature verification, but no
  //  encryption expected, need to fetch _two_ files.
  if (options.verify && !options.decrypt) {
    return getFileSignedUnencrypted(path, options);
  }

  const storedContents = await getFileContents({
    path,
    app: options.app!,
    username: options.username,
    zoneFileLookupURL: options.zoneFileLookupURL,
    forceText: !!options.decrypt,
    gaiaHubConfig: options.gaiaHubConfig,
  });
  if (storedContents === null) return storedContents;

  if (typeof storedContents !== 'string')
    throw new Error('[micro-stacks/storage] Expected to get back a string for the cipherText');

  let verify = !!options.verify;
  let decrypt = !!options.decrypt;
  const privateKey = typeof options.decrypt === 'string' ? options.decrypt : options.privateKey;

  // try to set options if provided incorrectly
  if (storedContents.includes('signature') && storedContents.includes('publicKey')) verify = true;
  if (storedContents.includes('cipherText') && storedContents.includes('ephemeralPK'))
    decrypt = true;

  if (!verify && !decrypt) return storedContents;

  const doesNotContainCypherText = !storedContents.includes('cipherText');

  if (decrypt && doesNotContainCypherText)
    throw new Error(
      `[micro-stacks/storage] Expected to get back a string that includes cipherText, is it encrypted? got back: ${JSON.stringify(
        storedContents
      )}`
    );

  if (!privateKey)
    throw new Error(
      '[micro-stacks/storage] No private key was passed to getFile, a private key needs to be passed if decrypt is set to true'
    );

  if (!verify) return decryptContent(storedContents, { privateKey });

  if (decrypt && verify)
    return handleSignedEncryptedContents({
      path,
      storedContents,
      app: options.app!,
      privateKey,
      username: options.username,
      zoneFileLookupURL: options.zoneFileLookupURL,
      gaiaHubConfig: options.gaiaHubConfig,
    });

  throw new Error('[micro-stacks/storage] Should be unreachable.');
}
