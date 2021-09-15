import { Account } from '../types';
import { privateKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';

/**
 * convert a compressed or uncompressed `stxPrivateKey` to a STX address of a given network version
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
