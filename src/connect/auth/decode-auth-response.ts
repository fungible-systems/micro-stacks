import { decodeToken, decryptECIES } from 'micro-stacks/crypto';
import { hexToJSON } from 'micro-stacks/common';

import type { AuthResponsePayload, StacksSessionState } from './types';

export async function decodeAuthResponse(
  authResponseToken: string,
  transitPrivateKey: string
): Promise<StacksSessionState> {
  const token = decodeToken(authResponseToken);
  const payload = token?.payload;
  const authResponse = payload as unknown as AuthResponsePayload;
  const { private_key: hexedEncryptedKey } = authResponse;
  const cipherObject = hexToJSON(hexedEncryptedKey);
  const appPrivateKey = (await decryptECIES({
    privateKey: transitPrivateKey,
    cipherObject,
  })) as string;

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
  };

  return sessionState;
}
