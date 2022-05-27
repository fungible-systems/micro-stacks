import {
  ClarityValue,
  cvToHex,
  serializeCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from 'micro-stacks/clarity';
import { bytesToHex, ChainID, concatByteArrays } from 'micro-stacks/common';
import { getPublicKey } from '@noble/secp256k1';
import { Json, TokenSigner } from 'micro-stacks/crypto';
import { openSignStructuredDataPopup } from '../popup';
import type { StructuredSignatureRequestOptions, SignedOptionsWithOnHandlers } from './types';
import { sha256 } from '@noble/hashes/sha256';

const structuredDataPrefix = Uint8Array.from([0xc0]);

export const makeClarityHash = (clarityValue: ClarityValue) => sha256(serializeCV(clarityValue));

export const makeDomainTuple = (name: string, version: string, chainId: ChainID) =>
  tupleCV({
    name: stringAsciiCV(name),
    version: stringAsciiCV(version),
    'chain-id': uintCV(chainId),
  });

export const makeStructuredDataHash = (
  domainHash: Uint8Array,
  structuredMessageHash: Uint8Array
) => {
  return sha256(concatByteArrays([structuredDataPrefix, domainHash, structuredMessageHash]));
};

export const generateSignStructuredDataPayload = async (
  options: StructuredSignatureRequestOptions
) => {
  const message = (
    typeof options.message === 'string' ? options.message : cvToHex(options.message)
  ).replace('0x', '');

  const payload = {
    stxAddress: options.stxAddress,
    message,
    appDetails: options.appDetails,
    publicKey: bytesToHex(getPublicKey(options.privateKey, true)),
    network: options.network,
  };

  const tokenSigner = new TokenSigner('ES256k', options.privateKey);
  return tokenSigner.sign(payload as unknown as Json);
};

export const handleSignStructuredDataRequest = async (
  options: SignedOptionsWithOnHandlers<StructuredSignatureRequestOptions>
) => {
  try {
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
  } catch (e: unknown) {
    console.error(`[micro-stacks] handleSignMessageRequest failed`);
    console.error(e);
  }
};
