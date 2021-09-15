import { generateMnemonic, mnemonicToSeed } from 'micro-stacks/bip39';
import { bytesToHex } from 'micro-stacks/common';
import { HDKeychain } from 'micro-stacks/bip32';

import { deriveWalletKeys } from './derive';
import { encryptMnemonic } from '../encryption/encrypt-mnemonic';
import { deriveAccountFromWallet } from '../account/derive-account';

import type { AllowedKeyEntropyBits, Wallet } from '../types';

/**
 * Generates a bip39 mnemonic phrase of 24 or 12 word length.
 *
 * This function is basically a type guard wrapper for
 * `generateMnemonic` from `micro-stacks/bip39`
 * to enforce either 256 or 128 bits of entropy.
 *
 * @param entropy {AllowedKeyEntropyBits} - 256 (24 words) or 128 (12 words)
 * @return mnemonic - 24 or 12 word mnemonic phrase
 */
export function generateSecretKey(entropy: AllowedKeyEntropyBits = 256): string {
  if (entropy !== 256 && entropy !== 128)
    throw TypeError(
      `Incorrect entropy bits provided, expected 256 or 128 (24 or 12 word results), got: "${String(
        entropy
      )}".`
    );
  return generateMnemonic(entropy);
}

/**
 * Generate a new [[Wallet]].
 * @param mnemonic A 12 or 24 word mnemonic phrase. Must be a valid bip39 mnemonic.
 * @param password A password used to encrypt the wallet
 */
export async function generateWallet(mnemonic: string, password: string): Promise<Wallet> {
  const encryptedSecretKey = bytesToHex(await encryptMnemonic(mnemonic, password));
  const walletKeys = await deriveWalletKeys(
    await HDKeychain.fromSeed(await mnemonicToSeed(mnemonic))
  );

  return generateAndInsertNewAccount({
    ...walletKeys,
    encryptedSecretKey,
    accounts: [],
  });
}

export async function generateAndInsertNewAccount(wallet: Wallet): Promise<Wallet> {
  return {
    ...wallet,
    accounts: [...wallet.accounts, await deriveAccountFromWallet(wallet)],
  };
}
