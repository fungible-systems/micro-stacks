import { HDKey } from '@scure/bip32';
import { bytesToHex } from 'micro-stacks/common';

import { DATA_DERIVATION_PATH, STX_DERIVATION_PATH } from '../constants';
import { isCompressed, isHardened } from '../utils';

import type { Account, Wallet } from '../types';

/**
 * Derive an account from a wallet
 * @param rootNode
 * @param index
 * @param salt
 */
export function deriveAccount(rootNode: HDKey, index: number, salt: string): Account {
  const childKey = rootNode.derive(STX_DERIVATION_PATH).deriveChild(index);

  if (!childKey.privateKey) throw Error('no private key');

  const identitiesKeychain = rootNode.derive(DATA_DERIVATION_PATH);
  const identityKeychain = identitiesKeychain.deriveChild(isHardened(index));

  if (!identityKeychain.privateKey) throw new Error('Must have private key to derive identities');

  const dataPrivateKey = bytesToHex(identityKeychain.privateKey);
  const appsKey = identityKeychain.deriveChild(isHardened(0)).privateExtendedKey;

  const stxPrivateKey = `${bytesToHex(childKey.privateKey)}${
    isCompressed(childKey.privateKey) ? '01' : ''
  }`;
  return {
    stxPrivateKey,
    dataPrivateKey,
    appsKey,
    salt,
    index,
  };
}

export function deriveNextAccountFromWallet(wallet: Wallet): Account {
  return deriveAccount(
    HDKey.fromExtendedKey(wallet.rootKey),
    // this function generates the next account for the wallet
    wallet.accounts.length,
    wallet.salt
  );
}

export function deriveManyAccountsForWallet(
  wallet: Wallet,
  count: number,
  startingIndex?: number
): Account[] {
  const accounts: Account[] = [];
  const indexes = [...Array(count).keys()];
  for (const _index of indexes) {
    const offset = startingIndex
      ? startingIndex
      : wallet.accounts.length > 0
      ? wallet.accounts.length - 1
      : 0;

    const index = offset + _index;
    const match = wallet.accounts[index];
    if (!match)
      accounts.push(deriveAccount(HDKey.fromExtendedKey(wallet.rootKey), index, wallet.salt));
  }
  return accounts;
}
