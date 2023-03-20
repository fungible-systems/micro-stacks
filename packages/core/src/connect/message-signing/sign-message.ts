import { SignatureRequestOptions, SignedOptionsWithOnHandlers } from './types';
import { openSignMessagePopup } from '../popup';
import { Json } from 'micro-stacks/crypto';
import { safeGetPublicKey } from '../common/utils';
import { createWalletJWT } from '../common/create-wallet-jwt';

export const generateSignMessagePayload = async (options: SignatureRequestOptions) => {
  const payload: Json = {
    stxAddress: options.stxAddress || null,
    message: options.message,
    appDetails: options.appDetails || null,
    publicKey: safeGetPublicKey(options.privateKey),
    network: options.network as any,
  };

  // will sign it or create unsigned JWT
  return createWalletJWT(payload, options.privateKey);
};

export const handleSignMessageRequest = async (
  options: SignedOptionsWithOnHandlers<SignatureRequestOptions>
) => {
  try {
    const token = await generateSignMessagePayload({
      message: options.message,
      network: options.network,
      privateKey: options.privateKey,
      stxAddress: options.stxAddress,
      authOrigin: options.authOrigin,
      appDetails: options.appDetails,
    });
    return openSignMessagePopup({
      token,
      onFinish: options.onFinish,
      onCancel: options.onCancel,
    });
  } catch (e: unknown) {
    console.error(`[micro-stacks] handleSignMessageRequest failed`);
    console.error(e);
  }
};
