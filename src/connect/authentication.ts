import { bytesToHex, getGlobalObject } from 'micro-stacks/common';
import { getPublicKey, getRandomBytes, TokenSigner } from 'micro-stacks/crypto';
import { decodeAuthResponse } from './auth/decode-auth-response';
import { getStacksProvider } from './common/get-stacks-provider';

import { SESSION_STORAGE_KEY } from './common/constants';
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
    const Provider: StacksProvider | undefined = getStacksProvider();
    const transitPrivateKey = bytesToHex(getRandomBytes());
    const transitPublicKey = getPublicKey(transitPrivateKey);

    const _scopes = authOptions.scopes || [];

    const origin = getGlobalObject('location', { returnEmptyObject: true })!.origin;
    const payload: AuthRequestPayload = {
      scopes: [...new Set(['store_write', ..._scopes])] as AuthScope[],
      redirect_uri: authOptions.redirectTo || origin,
      public_keys: [transitPublicKey],
      domain_name: origin,
      appDetails: authOptions.appDetails,
    };

    const signer = new TokenSigner('ES256k', transitPrivateKey);
    const authRequest = await signer.sign(payload as unknown as Json);
    const authResponseToken = await Provider!.authenticationRequest(authRequest);
    const sessionState = await decodeAuthResponse(authResponseToken, transitPrivateKey);

    authOptions?.onFinish?.(sessionState);
    storageAdapter.setItem(SESSION_STORAGE_KEY, serialize(sessionState));

    return sessionState;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    authOptions?.onCancel?.((e as any).message);
  }
}

declare global {
  interface Window {
    StacksProvider?: StacksProvider;
  }
}
