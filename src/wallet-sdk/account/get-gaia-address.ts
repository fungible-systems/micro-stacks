import { Account } from '../types';
import { publicKeyToBase58Address } from 'micro-stacks/crypto';
import { getPublicKey } from 'noble-secp256k1';

/**
 * Get the gaia hub address (base58) for a given account
 * @param account {Account}
 */
export function getGaiaAddress(account: Account): string {
  const isCompressed = account.stxPrivateKey.endsWith('01');
  return publicKeyToBase58Address(getPublicKey(account.dataPrivateKey, isCompressed));
}
