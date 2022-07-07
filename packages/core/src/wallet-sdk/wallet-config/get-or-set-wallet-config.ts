import { fetchWalletConfig } from './fetch-wallet-config';
import { Wallet } from '../types';
import { GaiaHubConfig } from 'micro-stacks/storage';
import { makeWalletConfig } from './make-wallet-config';
import { saveWalletConfig } from './save-wallet-config';

export interface GetOrSetWalletConfig {
  wallet: Wallet;
  gaiaHubConfig?: GaiaHubConfig;
  gaiaHubUrl?: string;
}

export async function getOrSetWalletConfig({
  wallet,
  gaiaHubConfig,
  gaiaHubUrl,
}: GetOrSetWalletConfig) {
  let walletConfig = await fetchWalletConfig(wallet.configPrivateKey, {
    gaiaHubConfig,
    gaiaHubUrl,
  });
  if (!walletConfig) {
    walletConfig = makeWalletConfig(wallet);
    await saveWalletConfig({
      walletConfig,
      gaiaHubConfig,
      gaiaHubUrl,
      privateKey: wallet.configPrivateKey,
    });
  }
  return walletConfig;
}
