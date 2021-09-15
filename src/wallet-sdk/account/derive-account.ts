import { HDKeychain } from 'micro-stacks/bip32';
import { bytesToHex } from 'micro-stacks/common';
import { DATA_DERIVATION_PATH, STX_DERIVATION_PATH } from '../constants';
import { Account, Wallet } from '../types';
import { isCompressed } from '../utils';

/**
 * Derive an account from a wallet
 * @param rootNode
 * @param index
 * @param salt
 */
export async function deriveAccount(
  rootNode: HDKeychain,
  index: number,
  salt: string
): Promise<Account> {
  const childKey = await (await rootNode.deriveFromPath(STX_DERIVATION_PATH)).deriveChild(index);

  if (!childKey.privateKey) throw Error('no private key');

  const identitiesKeychain = await rootNode.deriveFromPath(DATA_DERIVATION_PATH);
  const identityKeychain = await identitiesKeychain.deriveChild(index, true);

  if (!identityKeychain.privateKey) throw new Error('Must have private key to derive identities');

  const dataPrivateKey = bytesToHex(identityKeychain.privateKey);
  const appsKey = (await identityKeychain.deriveChild(0, true)).toBase58();

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

export async function deriveAccountFromWallet(wallet: Wallet): Promise<Account> {
  return deriveAccount(HDKeychain.fromBase58(wallet.rootKey), wallet.accounts.length, wallet.salt);
}
