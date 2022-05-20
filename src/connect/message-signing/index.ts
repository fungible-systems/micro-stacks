import { Json, TokenSigner } from 'micro-stacks/crypto';
import {
  AuthOptions,
  openSignMessagePopup,
  openSignStructuredDataPopup,
  SignatureData,
} from 'micro-stacks/connect';
import { StacksNetwork } from 'micro-stacks/network';
import { getPublicKey } from '@noble/secp256k1';
import { bytesToHex } from 'micro-stacks/common';
import { ClarityValue, cvToHex } from 'micro-stacks/clarity';

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
  authOrigin?: string;
  stxAddress: string;
  privateKey: string;
  network?: StacksNetwork;
}

export const generateSignMessagePayload = async (options: SignatureRequestOptions) => {
  return signMessagePayload(
    {
      stxAddress: options.stxAddress,
      message: options.message,
      appDetails: options.appDetails,
      publicKey: bytesToHex(getPublicKey(options.privateKey, true)),
      network: options.network,
    },
    options.privateKey
  );
};

export const generateSignStructuredDataPayload = async (
  options: Omit<SignatureRequestOptions, 'message'> & { message: string | ClarityValue }
) => {
  const message = (
    typeof options.message === 'string' ? options.message : cvToHex(options.message)
  ).replace('0x', '');

  return signMessagePayload(
    {
      stxAddress: options.stxAddress,
      message,
      appDetails: options.appDetails,
      publicKey: bytesToHex(getPublicKey(options.privateKey, true)),
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

export const handleSignStructuredDataRequest = async (
  options: Omit<SignatureRequestOptions, 'message'> & {
    message: ClarityValue | string;
    onFinish?: (payload: SignatureData) => void;
    onCancel?: (errorMessage?: string) => void;
  }
) => {
  const token = await generateSignStructuredDataPayload({
    message: options.message,
    privateKey: options.privateKey,
    stxAddress: options.stxAddress,
    authOrigin: options.authOrigin,
    appDetails: options.appDetails,
  });
  return openSignStructuredDataPopup({
    token,
    onFinish: options.onFinish,
    onCancel: options.onCancel,
  });
};
