import { getRandomBytes, TokenSigner, privateKeyToBase58Address } from 'micro-stacks/crypto';
import { getPublicKey } from 'micro-stacks/crypto';
import type {
  GaiaHubConfig,
  GaiaAuthScope,
  HubInfo,
  ScopedGaiaTokenOptions,
  GenerateGaiaHubConfigOptions,
} from './types';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Gaia takes the key 'domain' but 'path' makes more sense to someone implementing this
 */
function transformScopePath(scopes: GaiaAuthScope[]) {
  return scopes.map(scope => ({ ...scope, domain: scope.path }));
}

function makeDefaultScope(path: string): GaiaAuthScope {
  return {
    scope: 'putFilePrefix',
    path,
  };
}

/**
 * Generate a scoped gaia auth token
 */
export async function makeScopedGaiaAuthToken(options: ScopedGaiaTokenOptions): Promise<string> {
  const { hubInfo, privateKey, gaiaHubUrl, associationToken, scopes } = options;
  const { challenge_text: gaiaChallenge } = hubInfo;
  const iss = getPublicKey(privateKey, true);

  const salt = getRandomBytes(16).toString();
  const payload = {
    gaiaChallenge,
    hubUrl: gaiaHubUrl,
    iss,
    salt,
    associationToken,
    scopes: scopes ? transformScopePath(scopes) : undefined,
  };
  const signer = new TokenSigner('ES256K', privateKey);
  const token = await signer.sign(payload as any);
  return `v1:${token}`;
}

/**
 * Generates a gaia hub config to share with someone so they can edit a file
 */
export async function generateGaiaHubConfig(
  options: GenerateGaiaHubConfigOptions
): Promise<GaiaHubConfig> {
  const { gaiaHubUrl, privateKey, associationToken, scopes } = options;

  const response = await fetchPrivate(`${gaiaHubUrl}/hub_info`);
  const hubInfo: HubInfo = await response.json();

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
    max_file_upload_size_megabytes: max_file_upload_size_megabytes as any,
  };
}
