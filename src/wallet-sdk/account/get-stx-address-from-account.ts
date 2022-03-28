import { privateKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';

import type { Account } from '../types';

/**
 * convert a compressed or uncompressed `stxPrivateKey` to a Stacks address for a given network version (mainnet / testnet)
 * @param account {Account}
 * @param networkVersion {StacksNetworkVersion}
 */
export function getStxAddressFromAccount(
  account: Account,
  networkVersion = StacksNetworkVersion.mainnetP2PKH
): string {
  const isCompressed = account.stxPrivateKey.endsWith('01');
  return privateKeyToStxAddress(account.stxPrivateKey.slice(0, 64), networkVersion, isCompressed);
}
