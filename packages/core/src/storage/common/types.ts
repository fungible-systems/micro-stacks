import type { GaiaHubConfig } from '../gaia/types';
import type { EncryptionOptions } from 'micro-stacks/crypto';
export type FetcherFn = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
/**
 * Specify a valid MIME type, encryption options, and whether to sign the [[UserSession.putFile]].
 */
export interface PutFileOptions extends EncryptionOptions {
  /**
   * Specifies the Content-Type header for unencrypted data.
   * If the `encrypt` is enabled, this option is ignored, and the
   * Content-Type header is set to `application/json` for the ciphertext
   * JSON envelope.
   */
  contentType?: string;
  /**
   * Encrypt the data with the app public key.
   * If a string is specified, it is used as the public key.
   * If the boolean `true` is specified then the current user's app public key is used.
   * @default true
   */
  encrypt?: boolean | string;
  gaiaHubConfig: GaiaHubConfig;
  privateKey?: string;
  fetcher?: FetcherFn;
}

export interface GetFileUrlOptions {
  /**
   * The Blockstack ID to lookup for multi-player storage.
   * If not specified, the currently signed in username is used.
   */
  username?: string;
  /**
   * The app to lookup for multi-player storage - defaults to current origin.
   * @default `window.location.origin`
   * Only if available in the executing environment, otherwise `undefined`.
   */
  app?: string;
  /**
   * The URL to use for zonefile lookup. If falsey, this will use
   * the blockstack.js's [[getNameInfo]] function instead.
   */
  zoneFileLookupURL?: string;
}

/**
 * Used to pass options to [[UserSession.getFile]]
 */
export interface GetFileOptions extends GetFileUrlOptions {
  /**
   * Try to decrypt the data with the app private key.
   * If a string is specified, it is used as the private key.
   * @default true
   */
  decrypt?: boolean | string;
  /**
   * Whether the content should be verified, only to be used
   * when [[UserSession.putFile]] was set to `sign = true`.
   * @default false
   */
  verify?: boolean;
  gaiaHubConfig: GaiaHubConfig;
  privateKey?: string;
  fetcher?: FetcherFn;
}

export interface ProfileLookupOptions {
  username: string;
  verify?: boolean;
  zoneFileLookupURL?: string;
  fetcher?: FetcherFn;
}
