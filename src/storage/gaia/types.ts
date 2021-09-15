/**
 * The configuration for the user's Gaia storage provider.
 */
export interface GaiaHubConfig {
  address: string;
  url_prefix: string;
  token: string;
  max_file_upload_size_megabytes: number;
  server: string;
}

export interface UploadResponse {
  publicURL: string;
  etag?: string;
}

export interface HubInfo {
  challenge_text: string;
  latest_auth_version: string;
  max_file_upload_size_megabytes: null;
  read_url_prefix: string;
}

export type ScopeTypes =
  | 'putFile'
  | 'putFilePrefix'
  | 'deleteFile'
  | 'deleteFilePrefix'
  | 'putFileArchival'
  | 'putFileArchivalPrefix';

export interface GaiaAuthScope {
  scope: ScopeTypes;
  path: string;
}

export interface ScopedGaiaTokenOptions {
  hubInfo: HubInfo;
  privateKey: string;
  gaiaHubUrl: string;
  associationToken?: string;
  scopes?: GaiaAuthScope[];
}

export interface GenerateGaiaHubConfigOptions {
  gaiaHubUrl: string;
  privateKey: string;
  associationToken?: string;
  scopes?: GaiaAuthScope[];
}
