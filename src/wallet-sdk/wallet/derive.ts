import { HDKeychain } from 'micro-stacks/bip32';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { DATA_DERIVATION_PATH, WALLET_CONFIG_PATH } from '../constants';

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
export const deriveConfigPrivateKey = async (rootNode: HDKeychain): Promise<string> => {
  const derivedConfigKey = (await rootNode.deriveFromPath(WALLET_CONFIG_PATH)).privateKey;
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
export const deriveLegacyConfigPrivateKey = async (rootKey: string): Promise<string> => {
  const rootNode = HDKeychain.fromBase58(rootKey);
  const derivedLegacyPrivateKey = (await rootNode.deriveChild(45, true)).privateKey;
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
export async function deriveSalt(rootNode: HDKeychain): Promise<string> {
  return bytesToHex(
    hashSha256(
      utf8ToBytes(bytesToHex((await rootNode.deriveFromPath(DATA_DERIVATION_PATH)).publicKey))
    )
  );
}

export async function deriveWalletKeys(rootNode: HDKeychain): Promise<WalletKeys> {
  if (!rootNode.privateKey) throw Error('no private key');

  const [salt, rootKey, configPrivateKey] = await Promise.all([
    deriveSalt(rootNode),
    rootNode.toBase58(),
    deriveConfigPrivateKey(rootNode),
  ]);

  return {
    salt,
    rootKey,
    configPrivateKey,
  };
}
