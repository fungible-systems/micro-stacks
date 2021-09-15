import { generateGaiaHubConfig } from 'micro-stacks/storage';
import { Wallet } from '../types';
import { DEFAULT_GAIA_HUB_URL } from '../constants';

export function createWalletConfigGaiaHubConfig(wallet: Wallet) {
  return generateGaiaHubConfig({
    gaiaHubUrl: DEFAULT_GAIA_HUB_URL,
    privateKey: wallet.configPrivateKey,
  });
}
