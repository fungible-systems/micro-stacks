import { bytesToHex, getGlobalObject } from 'micro-stacks/common';
import { getPublicKey, getRandomBytes, TokenSigner } from 'micro-stacks/crypto';
import { decodeAuthResponse } from './auth/decode-auth-response';
import { getStacksProvider } from './common/get-stacks-provider';

import { PersistedDataKeys } from './common/constants';
import { defaultStorageAdapter } from './common/utils';

import type { StacksProvider } from './common/provider';
import type { Json } from 'micro-stacks/crypto';
import type { AuthRequestPayload, AuthOptions, AuthScope } from './auth/types';

export async function authenticate(
  authOptions: AuthOptions,
  storageAdapter = defaultStorageAdapter,
  serialize = JSON.stringify
) {
  if (!authOptions.appDetails) {
    throw Error(
      '[micro-stacks] authenticate error: `authOptions.appDetails` are required for authentication'
    );
  }
  try {
    const transitPrivateKey = bytesToHex(getRandomBytes());
    const authResponseToken = await handleAuthResponse(authOptions, transitPrivateKey);
    const sessionState = await decodeAuthResponse(authResponseToken, transitPrivateKey);

    authOptions?.onFinish?.(sessionState);
    storageAdapter.setItem(PersistedDataKeys.SessionStorageKey, serialize(sessionState));

    return sessionState;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    authOptions?.onCancel?.((e as any).message);
  }
  return undefined;
}

export function generateAuthRequestPayload(authOptions: AuthOptions, transitPublicKey: string) {
  if (!authOptions.appDetails) {
    throw Error(
      '[micro-stacks] authenticate error: `authOptions.appDetails` are required for authentication'
    );
  }
  const _scopes = authOptions.scopes || [];

  const origin = getGlobalObject('location', { returnEmptyObject: true })!.origin;
  const payload: AuthRequestPayload = {
    scopes: [...new Set(['store_write', ..._scopes])] as AuthScope[],
    redirect_uri: origin,
    public_keys: [transitPublicKey],
    domain_name: origin,
    appDetails: authOptions.appDetails,
  };

  return payload;
}

export async function signAuthRequest(payload: unknown, transitPrivateKey: string) {
  const signer = new TokenSigner('ES256k', transitPrivateKey);
  return signer.sign(payload as unknown as Json);
}

export async function generateSignedAuthRequest(
  authOptions: AuthOptions,
  transitPrivateKey: string
) {
  const transitPublicKey = bytesToHex(getPublicKey(transitPrivateKey));
  const payload = generateAuthRequestPayload(authOptions, transitPublicKey);
  return signAuthRequest(payload, transitPrivateKey);
}

export async function handleAuthResponse(authOptions: AuthOptions, transitPrivateKey: string) {
  const Provider: StacksProvider | undefined = getStacksProvider();
  if (!Provider)
    throw Error(
      'This function can only be called on the client, and with the presence of StacksProvider'
    );
  const authRequest = await generateSignedAuthRequest(authOptions, transitPrivateKey);
  return Provider!.authenticationRequest(authRequest);
}

declare global {
  interface Window {
    StacksProvider?: StacksProvider;
  }
}
