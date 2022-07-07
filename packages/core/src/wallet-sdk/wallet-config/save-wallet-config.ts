import { GaiaHubConfig, putFile } from 'micro-stacks/storage';
import { WALLET_CONFIG_GAIA_PATH } from '../constants';
import { WalletConfig } from '../types';
import { createWalletConfigGaiaHubConfig } from './create-gaia-hub-config';

interface SaveWalletConfig {
  walletConfig: WalletConfig;
  gaiaHubConfig?: GaiaHubConfig;
  gaiaHubUrl?: string;
  privateKey: string;
}

export async function saveWalletConfig({
  walletConfig,
  privateKey,
  gaiaHubConfig,
  gaiaHubUrl,
}: SaveWalletConfig) {
  if (!gaiaHubConfig) gaiaHubConfig = await createWalletConfigGaiaHubConfig(privateKey, gaiaHubUrl);
  await putFile(WALLET_CONFIG_GAIA_PATH, JSON.stringify(walletConfig), {
    gaiaHubConfig,
    privateKey,
    encrypt: true,
    sign: true,
  });
}
