import { SignatureRequestOptions, SignedOptionsWithOnHandlers } from './types';
import { openSignMessagePopup } from '../popup';
import { bytesToHex } from 'micro-stacks/common';
import { getPublicKey } from '@noble/secp256k1';
import { Json, TokenSigner } from 'micro-stacks/crypto';

export const generateSignMessagePayload = async (options: SignatureRequestOptions) => {
  const payload = {
    stxAddress: options.stxAddress,
    message: options.message,
    appDetails: options.appDetails,
    publicKey: bytesToHex(getPublicKey(options.privateKey, true)),
    network: options.network,
  };
  const tokenSigner = new TokenSigner('ES256k', options.privateKey);
  return tokenSigner.sign(payload as unknown as Json);
};

export const handleSignMessageRequest = async (
  options: SignedOptionsWithOnHandlers<SignatureRequestOptions>
) => {
  try {
    const token = await generateSignMessagePayload({
      message: options.message,
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
