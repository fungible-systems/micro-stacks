import { publicKeyToBase58Address, verifyECDSA } from 'micro-stacks/crypto';
import { arrayBufferToUint8, fetchPrivate, utf8ToBytes } from 'micro-stacks/common';

import { SIGNATURE_FILE_SUFFIX } from '../common/constants';
import {
  DoesNotExist,
  getBlockstackErrorFromResponse,
  SignatureVerificationError,
} from '../gaia/errors';
import { getFullReadUrl } from '../gaia/hub';
import { lookupProfile } from '../lookup-profile';

import type { GaiaHubConfig } from '../gaia/types';
import type { GetFileOptions, GetFileUrlOptions } from '../common/types';
import { FetcherFn } from '../common/types';

/**
 * Fetch the public read URL of a user file for the specified app.
 * @param {String} path - the path to the file to read
 * @param {String} username - The Blockstack ID of the user to look up
 * @param {String} appOrigin - The app origin
 * @param {String} [zoneFileLookupURL=null] - The URL
 * @param {FetcherFn} [fetcher=fetchPrivate] - The URL
 * to use for zonefile lookup. If falsey, this will use the
 * blockstack.js's [[getNameInfo]] function instead.
 * @return {Promise<string>} that resolves to the public read URL of the file
 * or rejects with an error
 */
export async function getUserAppFileUrl(
  path: string,
  username: string,
  appOrigin: string,
  zoneFileLookupURL?: string,
  fetcher?: FetcherFn
): Promise<string | undefined> {
  const profile = await lookupProfile({
    username,
    zoneFileLookupURL,
    fetcher: fetcher ?? fetchPrivate,
  });
  let bucketUrl: string | undefined;
  if (!profile) return;
  if (profile.hasOwnProperty('apps')) {
    if (profile.apps.hasOwnProperty(appOrigin)) {
      const url = profile.apps[appOrigin];
      const bucket = url.replace(/\/?(\?|#|$)/, '/$1');
      bucketUrl = `${bucket}${path}`;
    }
  } else if (profile.hasOwnProperty('appsMeta')) {
    if (profile.appsMeta.hasOwnProperty(appOrigin)) {
      const url = profile.appsMeta[appOrigin];
      const bucket = url.replace(/\/?(\?|#|$)/, '/$1');
      bucketUrl = `${bucket}${path}`;
    }
  }
  return bucketUrl;
}

/**
 * Get the URL for reading a file from an app's data store.
 *
 * @param {String} path - the path to the file to read
 * @param {GetFileUrlOptions} options - the options
 *
 * @returns {Promise<string>} that resolves to the URL or rejects with an error
 */
export async function getFileUrl(
  path: string,
  options: GetFileUrlOptions & {
    gaiaHubConfig: GaiaHubConfig;
    fetcher?: FetcherFn;
  }
): Promise<string> {
  let readUrl: string | undefined;
  if (options.username) {
    readUrl = await getUserAppFileUrl(
      path,
      options.username,
      options.app!,
      options.zoneFileLookupURL,
      options.fetcher ?? fetchPrivate
    );
  } else {
    readUrl = getFullReadUrl(path, options.gaiaHubConfig);
  }

  if (!readUrl) {
    throw new Error('Missing readURL');
  } else {
    return readUrl;
  }
}

/**
 * Get the gaia address used for servicing multiplayer reads for the given
 * (username, app) pair.
 * @private
 * @ignore
 */
export async function getGaiaAddress(options: {
  app: string;
  gaiaHubConfig?: GaiaHubConfig;
  username?: string;
  zoneFileLookupURL?: string;
  fetcher?: FetcherFn;
}): Promise<string> {
  const { app, username, zoneFileLookupURL, gaiaHubConfig, fetcher = fetchPrivate } = options;
  let fileUrl: string | undefined;
  if (username) {
    fileUrl = await getUserAppFileUrl('/', username!, app, zoneFileLookupURL, fetcher);
  } else if (gaiaHubConfig) {
    fileUrl = getFullReadUrl('/', gaiaHubConfig);
  }
  const matches = /([13][a-km-zA-HJ-NP-Z0-9]{26,35})/.exec(fileUrl!);
  if (!matches) {
    throw new Error('Failed to parse gaia address');
  }
  return matches[matches.length - 1];
}

/**
 * Handle fetching the contents from a given path. Handles both
 * multi-player reads and reads from own storage.
 *
 * @private
 * @ignore
 */
export async function getFileContents(options: {
  path: string;
  app: string;
  username: string | undefined;
  zoneFileLookupURL?: string;
  forceText: boolean;
  gaiaHubConfig: GaiaHubConfig;
  fetcher?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
}): Promise<string | Uint8Array | null> {
  const {
    path,
    forceText,
    app,
    username,
    zoneFileLookupURL,
    gaiaHubConfig,
    fetcher = fetchPrivate,
  } = options;
  const readUrl = await getFileUrl(path, {
    app,
    username,
    zoneFileLookupURL,
    gaiaHubConfig,
    fetcher,
  });
  const response = await fetcher(readUrl);
  if (!response.ok) {
    throw await getBlockstackErrorFromResponse(response, `getFile ${path} failed.`, null);
  }
  let contentType = response.headers.get('Content-Type');

  if (typeof contentType === 'string') contentType = contentType.toLowerCase();

  if (
    forceText ||
    contentType === null ||
    contentType.startsWith('text') ||
    contentType.startsWith('application/json')
  ) {
    return response.text();
  } else {
    const arrayBuffer = await response.arrayBuffer();
    return arrayBufferToUint8(arrayBuffer);
  }
}

/**
 * Handle fetching an unencrypted file, its associated signature
 * and then validate it. Handles both multi-player reads and reads
 * from own storage.
 *
 * @private
 * @ignore
 */
export async function getFileSignedUnencrypted(path: string, options: GetFileOptions) {
  const { app, username, zoneFileLookupURL, gaiaHubConfig, fetcher = fetchPrivate } = options;
  // future optimization note:
  //    in the case of _multi-player_ reads, this does a lot of excess
  //    profile lookups to figure out where to read files
  //    do browsers cache all these requests if Content-Cache is set?
  const sigPath = `${path}${SIGNATURE_FILE_SUFFIX}`;
  try {
    const [fileContents, signatureContents, gaiaAddress] = await Promise.all([
      getFileContents({
        path,
        app: app!,
        username,
        zoneFileLookupURL,
        forceText: false,
        gaiaHubConfig,
        fetcher,
      }),
      getFileContents({
        path: sigPath,
        app: app!,
        username,
        zoneFileLookupURL,
        forceText: true,
        gaiaHubConfig,
        fetcher,
      }),
      getGaiaAddress({
        app: app!,
        username,
        zoneFileLookupURL,
        gaiaHubConfig,
        fetcher,
      }),
    ]);

    if (!fileContents) {
      return fileContents;
    }
    if (!gaiaAddress) {
      throw new SignatureVerificationError(
        'Failed to get gaia address for verification of: ' + `${path}`
      );
    }
    if (!signatureContents || typeof signatureContents !== 'string') {
      throw new SignatureVerificationError(
        'Failed to obtain signature for file: ' +
          `${path} -- looked in ${path}${SIGNATURE_FILE_SUFFIX}`
      );
    }
    let signature: string;
    let publicKey: string;
    try {
      const sigObject = JSON.parse(signatureContents);
      signature = sigObject.signature;
      publicKey = sigObject.publicKey;
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error(
          'Failed to parse signature content JSON ' +
            `(path: ${path}${SIGNATURE_FILE_SUFFIX})` +
            ' The content may be corrupted.'
        );
      } else {
        throw err;
      }
    }
    const signerAddress = publicKeyToBase58Address(publicKey);
    const msgHash = typeof fileContents === 'string' ? utf8ToBytes(fileContents) : fileContents;

    const verified = verifyECDSA({ signature, contents: msgHash, publicKey });

    if (gaiaAddress !== signerAddress) {
      throw new SignatureVerificationError(
        `Signer pubkey address (${signerAddress}) doesn't` + ` match gaia address (${gaiaAddress})`
      );
    } else if (!verified) {
      throw new SignatureVerificationError(
        'Contents do not match ECDSA signature: ' +
          `path: ${path}, signature: ${path}${SIGNATURE_FILE_SUFFIX}`
      );
    } else {
      return fileContents;
    }
  } catch (err) {
    // For missing .sig files, throw `SignatureVerificationError` instead of `DoesNotExist` error.
    if (err instanceof DoesNotExist && err.message.indexOf(sigPath) >= 0) {
      throw new SignatureVerificationError(
        'Failed to obtain signature for file: ' +
          `${path} -- looked in ${path}${SIGNATURE_FILE_SUFFIX}`
      );
    } else {
      throw err;
    }
  }
}
