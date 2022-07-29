import { getRandomBytes, TokenSigner, privateKeyToBase58Address, Json } from 'micro-stacks/crypto';
import { bytesToHex, fetchPrivate } from 'micro-stacks/common';
import { getPublicKey } from 'micro-stacks/crypto';
import type {
  GaiaHubConfig,
  GaiaAuthScope,
  HubInfo,
  ScopedGaiaTokenOptions,
  GenerateGaiaHubConfigOptions,
} from './types';
import { FetcherFn } from '../common/types';

/**
 * Gaia takes the key 'domain' but 'path' makes more sense to someone implementing this
 */
function transformScopePath(scopes?: GaiaAuthScope[]) {
  return scopes?.map(scope => ({ ...scope, domain: scope.path })) ?? null;
}

export function makeScopedGaiaAuthTokenPayload(options: ScopedGaiaTokenOptions): Json {
  const { hubInfo, privateKey, gaiaHubUrl, associationToken = null, scopes } = options;
  const { challenge_text: gaiaChallenge } = hubInfo;
  const iss = bytesToHex(getPublicKey(privateKey, true));

  const salt = getRandomBytes(16).toString();
  const payload: Json = {
    gaiaChallenge,
    hubUrl: gaiaHubUrl,
    iss,
    salt,
    associationToken,
    scopes: transformScopePath(scopes),
  };
  return payload;
}

/**
 * Generate a scoped gaia auth token
 */

export async function makeScopedGaiaAuthToken(options: ScopedGaiaTokenOptions): Promise<string> {
  const payload = makeScopedGaiaAuthTokenPayload(options);
  const signer = new TokenSigner('ES256K', options.privateKey);
  const token = await signer.sign(payload);
  return `v1:${token}`;
}

export function makeScopedGaiaAuthTokenSync(options: ScopedGaiaTokenOptions): string {
  const payload = makeScopedGaiaAuthTokenPayload(options);
  const signer = new TokenSigner('ES256K', options.privateKey);
  const token = signer.signSync(payload);
  return `v1:${token}`;
}

const DEFAULT_PAYLOAD = (server_url: string): HubInfo => ({
  challenge_text: '["gaiahub","0","gaia-0","blockstack_storage_please_sign"]',
  latest_auth_version: 'v1',
  max_file_upload_size_megabytes: 20,
  read_url_prefix: `${server_url}/hub/`,
});

/**
 * Generates a gaia hub config to share with someone so they can edit a file
 */
export async function generateGaiaHubConfig(
  { gaiaHubUrl, privateKey, associationToken, scopes }: GenerateGaiaHubConfigOptions,
  options?: {
    fetchHubInfo?: boolean;
    fetcher?: FetcherFn;
  }
): Promise<GaiaHubConfig> {
  let hubInfo = DEFAULT_PAYLOAD(gaiaHubUrl ?? 'https://gaia.blockstack.org');

  if (options?.fetchHubInfo) {
    try {
      const path = `${gaiaHubUrl}/hub_info`;
      const fetcher = options.fetcher ?? fetchPrivate;
      const response = await fetcher(path);
      hubInfo = await response.json();
    } catch (e) {
      console.error(e);
      console.error('Cannot fetch Gaia hub information, using default gaia hub configuration');
    }
  }

  const { read_url_prefix: url_prefix, max_file_upload_size_megabytes } = hubInfo;

  const token = await makeScopedGaiaAuthToken({
    hubInfo,
    privateKey,
    gaiaHubUrl,
    associationToken,
    scopes,
  });

  const address = privateKeyToBase58Address(privateKey);

  return {
    address,
    url_prefix,
    token,
    server: gaiaHubUrl,
    max_file_upload_size_megabytes: max_file_upload_size_megabytes ?? 20,
  };
}

// sync version
export function generateGaiaHubConfigSync(options: GenerateGaiaHubConfigOptions): GaiaHubConfig {
  const { gaiaHubUrl, privateKey, associationToken, scopes } = options;
  const hubInfo = DEFAULT_PAYLOAD(gaiaHubUrl ?? 'https://gaia.blockstack.org');

  const { read_url_prefix: url_prefix, max_file_upload_size_megabytes } = hubInfo;

  const token = makeScopedGaiaAuthTokenSync({
    hubInfo,
    privateKey,
    gaiaHubUrl,
    associationToken,
    scopes,
  });

  const address = privateKeyToBase58Address(privateKey);

  return {
    address,
    url_prefix,
    token,
    server: gaiaHubUrl,
    max_file_upload_size_megabytes: max_file_upload_size_megabytes ?? 20,
  };
}
