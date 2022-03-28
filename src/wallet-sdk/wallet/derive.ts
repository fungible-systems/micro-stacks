import { HDKey } from '@scure/bip32';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { DATA_DERIVATION_PATH, WALLET_CONFIG_PATH } from '../constants';
import { isHardened } from '../utils';
import type { WalletKeys } from '../types';

/**
 * Derive the `configPrivateKey` for a wallet.
 *
 * This key is derived from the path `m/44/5757'/0'/1`, using `1` for change option,
 * following the bip44 recommendation for keys relating to non-public data.
 *
 * > m / purpose' / coin_type' / account' / change / address_index

 *
 * This key is used to encrypt configuration data related to a wallet, so the user's
 * configuration can be synced across wallets.
 *
 * @param rootNode A keychain that was created using the wallet mnemonic phrase
 */
export const deriveConfigPrivateKey = (rootNode: HDKey): string => {
  const derivedConfigKey = rootNode.derive(WALLET_CONFIG_PATH).privateKey;
  if (!derivedConfigKey) throw new TypeError('Unable to derive config key for wallet identities');
  return bytesToHex(derivedConfigKey);
};

/**
 * Before modern Stacks Wallets, previous authenticators used a different format
 * and path for the config file.
 *
 * The path for this key is `m/45'`
 * @param rootKey A base64 encoded HDKeychain (BIP32) that was created using the wallet mnemonic phrase
 * @return privateKey Hex encoded legacy private key
 */
export const deriveLegacyConfigPrivateKey = (rootKey: string): string => {
  const rootNode = HDKey.fromExtendedKey(rootKey);
  const legacyNode = rootNode.deriveChild(isHardened(45));
  const derivedLegacyPrivateKey = legacyNode.privateKey;
  if (!derivedLegacyPrivateKey)
    throw new TypeError('Unable to derive config key for wallet identities');
  return bytesToHex(derivedLegacyPrivateKey);
};

/**
 * Generate a salt, which is used for generating an app-specific private key
 * the salt is the hex encoded public key converted to bytes, SHA256 hashed and then hex encoded
 * @param rootNode A keychain that was created using the wallet mnemonic phrase
 * @return salt A hex encoded hash
 */
export function deriveSalt(rootNode: HDKey): string {
  const publicKey = rootNode.derive(DATA_DERIVATION_PATH).publicKey;
  if (!publicKey) throw new TypeError('Unable to derive public key from data derivation path');
  return bytesToHex(hashSha256(utf8ToBytes(bytesToHex(publicKey))));
}

export function deriveWalletKeys(rootNode: HDKey): WalletKeys {
  if (!rootNode.privateKey) throw Error('no private key');

  const salt = deriveSalt(rootNode);
  const rootKey = rootNode.privateExtendedKey;
  const configPrivateKey = deriveConfigPrivateKey(rootNode);

  return {
    salt,
    rootKey,
    configPrivateKey,
  };
}
