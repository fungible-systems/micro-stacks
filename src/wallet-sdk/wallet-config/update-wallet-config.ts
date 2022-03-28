import type { Wallet, Account, ConfigApp, WalletConfig } from '../types';
import type { GaiaHubConfig } from 'micro-stacks/storage';
import { saveWalletConfig } from './save-wallet-config';

interface UpdateAppsMeta {
  wallet: Wallet;
  app: ConfigApp;
  account: Account;
  walletConfig: WalletConfig;
}

/**
 * This method will add the apps data to the walletConfig
 * @param wallet
 * @param walletConfig
 * @param app
 * @param account
 */
function updateAppsMeta({ wallet, walletConfig, app, account }: UpdateAppsMeta) {
  for (const _account of wallet.accounts) {
    let index = 0;
    const configApp = walletConfig.accounts[index];
    if (configApp) {
      configApp.apps = configApp.apps || {};
      configApp.username = _account?.username;
      walletConfig.accounts[index] = configApp;
    } else {
      walletConfig.accounts.push({
        username: _account?.username,
        apps: {},
      });
    }
    // handle current account
    if (index === account.index) {
      const configAccount = walletConfig.accounts[index];
      configAccount.apps = configAccount.apps || {};
      configAccount.apps[app.origin] = app;
      walletConfig.accounts[index] = configAccount;
    }
    index += 1;
  }
  return walletConfig;
}

interface UpdateWalletConfigWithApp extends UpdateAppsMeta {
  gaiaHubConfig?: GaiaHubConfig;
}

export const updateWalletConfigWithApp = async ({
  wallet,
  account,
  app,
  walletConfig,
  gaiaHubConfig,
}: UpdateWalletConfigWithApp): Promise<WalletConfig> => {
  const updatedWalletConfig = updateAppsMeta({
    wallet,
    walletConfig,
    app,
    account,
  });

  await saveWalletConfig({
    walletConfig: updatedWalletConfig,
    gaiaHubConfig,
    privateKey: wallet.configPrivateKey,
  });

  return walletConfig;
};

export const addNewAccountToWalletConfig = async ({
  wallet,
  walletConfig,
  gaiaHubConfig,
}: UpdateWalletConfigWithApp): Promise<WalletConfig> => {
  const updatedWalletConfig: WalletConfig = {
    ...walletConfig,
    accounts: [
      ...walletConfig.accounts,
      {
        apps: {},
      },
    ],
  };

  await saveWalletConfig({
    walletConfig: updatedWalletConfig,
    gaiaHubConfig,
    privateKey: wallet.configPrivateKey,
  });

  return walletConfig;
};
