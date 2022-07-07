export {
  generateAndInsertNewAccount,
  generateSecretKey,
  generateWallet,
} from './wallet-sdk/wallet/generate';
export {
  deriveConfigPrivateKey,
  deriveLegacyConfigPrivateKey,
  deriveWalletKeys,
  deriveSalt,
} from './wallet-sdk/wallet/derive';

export {
  deriveAccount,
  deriveNextAccountFromWallet,
  deriveManyAccountsForWallet,
} from './wallet-sdk/account/derive-account';
export { getStxAddressFromAccount } from './wallet-sdk/account/get-stx-address-from-account';
export { getAppPrivateKey } from './wallet-sdk/account/get-app-private-key';
export { getGaiaAddress } from './wallet-sdk/account/get-gaia-address';

export { encryptMnemonic } from './wallet-sdk/encryption/encrypt-mnemonic';
export { decryptMnemonic } from './wallet-sdk/encryption/decrypt-mnemonic';

export * from './wallet-sdk/auth';
export * from './wallet-sdk/wallet-config';

export type {
  AllowedKeyEntropyBits,
  Wallet,
  WalletKeys,
  LockedWallet,
  WalletConfig,
  ConfigApp,
  ConfigAccount,
  Account,
} from './wallet-sdk/types';
