import { generateGaiaHubConfig } from 'micro-stacks/storage';
import { DEFAULT_GAIA_HUB_URL } from '../constants';

export function createWalletConfigGaiaHubConfig(
  privateKey: string,
  gaiaHubUrl: string = DEFAULT_GAIA_HUB_URL
) {
  return generateGaiaHubConfig({
    gaiaHubUrl,
    privateKey,
  });
}
