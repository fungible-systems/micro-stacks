import { decodeToken, decryptECIES } from 'micro-stacks/crypto';
import { hexToJSON } from 'micro-stacks/common';

import type { AuthResponsePayload, StacksSessionState } from './types';

export function getDIDType(decentralizedID: string) {
  const didParts = decentralizedID.split(':');
  if (didParts.length !== 3) throw new TypeError('Decentralized IDs must have 3 parts');
  if (didParts[0].toLowerCase() !== 'did')
    throw new TypeError('Decentralized IDs must start with "did"');
  return didParts[1].toLowerCase();
}

export function getAddressFromDID(decentralizedID: string): string | undefined {
  return decentralizedID && getDIDType(decentralizedID) === 'btc-addr'
    ? decentralizedID.split(':')[2]
    : undefined;
}

export async function decodeAuthResponse(
  authResponseToken: string,
  transitPrivateKey: string
): Promise<StacksSessionState> {
  const token = decodeToken(authResponseToken);
  const payload = token?.payload;
  const authResponse = payload as unknown as AuthResponsePayload;

  let appPrivateKey;

  if (authResponse.private_key) {
    try {
      const cipherObject = hexToJSON(authResponse.private_key);
      appPrivateKey = (await decryptECIES({
        privateKey: transitPrivateKey,
        cipherObject,
      })) as string;
    } catch (e) {
      console.error('[micro-stacks] failed to decrypt appPrivateKey');
    }
  }

  const sessionState: StacksSessionState = {
    addresses: authResponse.profile.stxAddress,
    appPrivateKey,
    associationToken: authResponse.associationToken,
    hubUrl: authResponse.hubUrl,
    public_keys: authResponse.public_keys,
    profile: authResponse['profile'],
    profile_url: authResponse.profile_url,
    username: authResponse.username,
    version: authResponse.version,
    decentralizedID: authResponse.iss,
    identityAddress: getAddressFromDID(authResponse.iss),
  };

  return sessionState;
}
