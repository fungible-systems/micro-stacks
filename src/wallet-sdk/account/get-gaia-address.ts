import { getPublicKey, publicKeyToBase58Address } from 'micro-stacks/crypto';

import type { Account } from '../types';

/**
 * Get the gaia hub address (base58) for a given account
 * @param account {Account}
 */
export function getGaiaAddress(account: Account): string {
  const isCompressed = account.stxPrivateKey.endsWith('01');
  return publicKeyToBase58Address(getPublicKey(account.dataPrivateKey, isCompressed));
}
