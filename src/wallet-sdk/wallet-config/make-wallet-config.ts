import { Wallet, WalletConfig } from '../types';

export function makeWalletConfig(wallet: Wallet): WalletConfig {
  return {
    accounts: wallet.accounts.map(account => ({
      username: account.username,
      apps: {},
    })),
  };
}
