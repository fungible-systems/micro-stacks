import { Account } from '../types';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { HDKey, Versions } from '@scure/bip32';
import { isHardened } from '../utils';

const BITCOIN_VERSIONS: Versions = { private: 0x0488ade4, public: 0x0488b21e };

function hashCode(string: string): number {
  let hash = 0;
  if (string.length === 0) return hash;
  for (let i = 0; i < string.length; i++) {
    const character = string.charCodeAt(i);
    hash = (hash << 5) - hash + character;
    hash &= hash;
  }
  return hash & 0x7fffffff;
}

export function getAppPrivateKey(account: Account, appDomain: string, legacy = true): string {
  if (legacy) return getLegacyAppPrivateKey(account, appDomain);
  // Rather than using the `hashCode` function to derive an index for the child
  // which makes it so there's a unreasonable high probability that someone can
  // log into a new app (website) and it accidentally shares data with another one
  //
  // we want to use the `appDomain` + `salt` to generate a sha256 hash that is
  // then used as the chaincode for the new app keychain
  const chainCode = hashSha256(utf8ToBytes(`${appDomain}${account.salt}`));
  const rootNode = HDKey.fromExtendedKey(account.appsKey);
  if (!rootNode.privateKey) throw Error('no rootNode.privateKey');
  const appKeychain = new HDKey({
    privateKey: rootNode.privateKey,
    chainCode,
    versions: BITCOIN_VERSIONS,
  }).deriveChild(isHardened(0));
  if (!appKeychain.privateKey)
    throw new Error('[micro-stacks/wallet-sdk] getAppPrivateKey: No private key found');
  return bytesToHex(appKeychain.privateKey);
}

export function getLegacyAppPrivateKey(account: Account, appDomain: string): string {
  const hashBuffer = bytesToHex(hashSha256(utf8ToBytes(`${appDomain}${account.salt}`)));
  const appIndex = hashCode(hashBuffer);
  const appKeychain = HDKey.fromExtendedKey(account.appsKey).deriveChild(isHardened(appIndex));
  if (!appKeychain.privateKey)
    throw new Error('[micro-stacks/wallet-sdk] getLegacyAppPrivateKey: No private key found');
  return bytesToHex(appKeychain.privateKey);
}
