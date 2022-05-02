import { Json, TokenSigner } from 'micro-stacks/crypto';
import { AuthOptions, openSignMessagePopup, SignatureData } from 'micro-stacks/connect';
import { StacksNetwork } from 'micro-stacks/network';
import { getPublicKey } from '@noble/secp256k1';
import { bytesToHex } from 'micro-stacks/common';

export interface SignaturePayload {
  message: string;
  publicKey: string;
  stxAddress: string;
  appDetails: AuthOptions['appDetails'];
  network?: StacksNetwork;
}

const signMessagePayload = (payload: SignaturePayload, privateKey: string) => {
  const tokenSigner = new TokenSigner('ES256k', privateKey);
  return tokenSigner.sign(payload as unknown as Json);
};

export interface SignatureRequestOptions {
  message: string;
  appDetails: AuthOptions['appDetails'];
  authOrigin: string;
  stxAddress: string;
  privateKey: string;
  network?: StacksNetwork;
}

export const generateSignMessagePayload = async (options: SignatureRequestOptions) => {
  return signMessagePayload(
    {
      message: options.message,
      publicKey: bytesToHex(getPublicKey(options.privateKey)),
      stxAddress: options.stxAddress,
      appDetails: options.appDetails,
      network: options.network,
    },
    options.privateKey
  );
};

export const handleSignMessageRequest = async (
  options: SignatureRequestOptions & {
    onFinish?: (payload: SignatureData) => void;
    onCancel?: (errorMessage?: string) => void;
  }
) => {
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
};
