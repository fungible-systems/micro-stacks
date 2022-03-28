import { Wallet, WalletConfig } from '../types';
import { deriveManyAccountsForWallet } from '../account/derive-account';

/**
 * This function will look for an existing wallet config from gaia
 * if one is found, it will return a wallet with the correct number of accounts generated
 * if one is not found, it will return the wallet that was passed to it
 * @param wallet
 * @param walletConfig
 */
export async function restoreWalletAccountsFromWalletConfig({
  wallet,
  walletConfig,
}: {
  wallet: Wallet;
  walletConfig: WalletConfig;
}): Promise<Wallet> {
  // if there is no wallet config, or no accounts, just return the wallet as-is
  if (!walletConfig || walletConfig.accounts.length === 0) return wallet;
  const total_accounts = walletConfig.accounts.length;
  const accounts = await deriveManyAccountsForWallet(wallet, total_accounts);
  return {
    ...wallet,
    accounts,
  };
}
