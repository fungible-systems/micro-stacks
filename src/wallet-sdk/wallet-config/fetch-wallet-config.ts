import { Wallet, WalletConfig } from '../types';
import type { GaiaHubConfig } from 'micro-stacks/storage';
import { getFile } from 'micro-stacks/storage';
import { WALLET_CONFIG_GAIA_PATH } from '../constants';
import { createWalletConfigGaiaHubConfig } from './create-gaia-hub-config';

export async function fetchWalletConfig(
  wallet: Wallet,
  gaiaHubConfig?: GaiaHubConfig
): Promise<WalletConfig> {
  if (!gaiaHubConfig) gaiaHubConfig = await createWalletConfigGaiaHubConfig(wallet);
  const response = await getFile(WALLET_CONFIG_GAIA_PATH, {
    privateKey: wallet.configPrivateKey,
    gaiaHubConfig,
  });
  if (typeof response !== 'string')
    throw new TypeError('Wallet config response should be of type string');
  return JSON.parse(response) as WalletConfig;
}
