import { Account } from '../types';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { HDKeychain } from 'micro-stacks/bip32';

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

export async function getAppPrivateKey(
  account: Account,
  appDomain: string,
  legacy = true
): Promise<string> {
  if (legacy) return getLegacyAppPrivateKey(account, appDomain);
  // Rather than using the `hashCode` function to derive an index for the child
  // which makes it so there's a unreasonable high probability that someone can
  // log into a new app (website) and it accidentally shares data with another one
  //
  // we want to use the `appDomain` + `salt` to generate a sha256 hash that is
  // then used as the chaincode for the new app keychain
  const chainCode = hashSha256(utf8ToBytes(`${appDomain}${account.salt}`));
  const rootNode = HDKeychain.fromBase58(account.appsKey);
  const appKeychain = await HDKeychain.fromPrivateKey(rootNode.privateKey, chainCode).deriveChild(
    0,
    true
  );
  if (!appKeychain.privateKey)
    throw new Error('[micro-stacks/wallet-sdk] getAppPrivateKey: No private key found');
  return bytesToHex(appKeychain.privateKey);
}

export async function getLegacyAppPrivateKey(account: Account, appDomain: string): Promise<string> {
  const hashBuffer = bytesToHex(hashSha256(utf8ToBytes(`${appDomain}${account.salt}`)));
  const appIndex = hashCode(hashBuffer);
  const appKeychain = await HDKeychain.fromBase58(account.appsKey).deriveChild(appIndex, true);
  if (!appKeychain.privateKey)
    throw new Error('[micro-stacks/wallet-sdk] getLegacyAppPrivateKey: No private key found');
  return bytesToHex(appKeychain.privateKey);
}
