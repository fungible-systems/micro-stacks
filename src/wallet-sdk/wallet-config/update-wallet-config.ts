import type { Wallet, Account, ConfigApp, WalletConfig } from '../types';
import { putFile } from 'micro-stacks/storage';
import type { GaiaHubConfig } from 'micro-stacks/storage';
import { WALLET_CONFIG_GAIA_PATH } from '../constants';
import { createWalletConfigGaiaHubConfig } from './create-gaia-hub-config';

export const updateWalletConfigWithApp = async ({
  wallet,
  account,
  app,
  gaiaHubConfig,
  walletConfig,
}: {
  wallet: Wallet;
  account: Account;
  app: ConfigApp;
  gaiaHubConfig?: GaiaHubConfig;
  walletConfig: WalletConfig;
}) => {
  if (!gaiaHubConfig) gaiaHubConfig = await createWalletConfigGaiaHubConfig(wallet);

  wallet.accounts.forEach((account, index) => {
    const configApp = walletConfig.accounts[index];
    if (configApp) {
      configApp.apps = configApp.apps || {};
      configApp.username = account.username;
      walletConfig.accounts[index] = configApp;
    } else {
      walletConfig.accounts.push({
        username: account.username,
        apps: {},
      });
    }
  });

  const configAccount = walletConfig.accounts[account.index];
  configAccount.apps = configAccount.apps || {};
  configAccount.apps[app.origin] = app;
  walletConfig.accounts[account.index] = configAccount;
  await putFile(WALLET_CONFIG_GAIA_PATH, JSON.stringify(walletConfig), {
    gaiaHubConfig,
    privateKey: wallet.configPrivateKey,
    encrypt: true,
    sign: true,
  });
  return walletConfig;
};
