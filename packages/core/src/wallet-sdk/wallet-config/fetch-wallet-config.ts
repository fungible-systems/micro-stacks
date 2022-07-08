import { getFile } from 'micro-stacks/storage';
import { WALLET_CONFIG_GAIA_PATH } from '../constants';
import { createWalletConfigGaiaHubConfig } from './create-gaia-hub-config';

import type { GaiaHubConfig } from 'micro-stacks/storage';
import type { WalletConfig } from '../types';

export async function fetchWalletConfig(
  privateKey: string,
  options?: {
    gaiaHubConfig?: GaiaHubConfig;
    gaiaHubUrl?: string;
  }
): Promise<WalletConfig | undefined> {
  try {
    let gaiaHubConfig = options?.gaiaHubConfig;
    if (!gaiaHubConfig)
      gaiaHubConfig = await createWalletConfigGaiaHubConfig(privateKey, options?.gaiaHubUrl);
    const response = await getFile(WALLET_CONFIG_GAIA_PATH, {
      privateKey,
      gaiaHubConfig,
    });
    if (typeof response !== 'string') {
      console.error('Wallet config response should be of type string');
      return;
    }

    return JSON.parse(response) as WalletConfig;
  } catch (e) {}

  return;
}
