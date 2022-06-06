import {
  ClarityValue,
  hexToCV,
  serializeCV,
  stringAsciiCV,
  tupleCV,
  uintCV,
} from 'micro-stacks/clarity';
import { bytesToHex, ChainID, concatByteArrays } from 'micro-stacks/common';
import { Json } from 'micro-stacks/crypto';
import { openSignMessagePopup } from '../popup';
import type { SignedOptionsWithOnHandlers, StructuredSignatureRequestOptions } from './types';
import { sha256 } from '@noble/hashes/sha256';
import { safeGetPublicKey } from '../common/utils';
import { createWalletJWT } from '../common/create-wallet-jwt';

const structuredDataPrefix = Uint8Array.from([0x53, 0x49, 0x50, 0x30, 0x31, 0x38]); // SIP018

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
  // this is a temp hack to support the latest SIP018 implementation
  // where the app needs to pass the domain information
  // in addition to the structured message
  // the hiro wallet will correctly sign this using the `signMessage` functionality
  // not the structured message hook they have exposed via StacksProvider
  // once the team implements the changes, this will be reverted
  const message: ClarityValue =
    typeof options.message === 'string' ? hexToCV(options.message) : options.message;

  const domainTuple = makeDomainTuple(
    options.domain.name,
    options.domain.version,
    options.domain.chainId ?? options.network?.chainId ?? ChainID.Mainnet
  );

  const hash = makeStructuredDataHash(makeClarityHash(domainTuple), makeClarityHash(message));

  const payload: Json = {
    stxAddress: options.stxAddress,
    message: bytesToHex(hash),
    appDetails: options.appDetails,
    publicKey: safeGetPublicKey(options.privateKey),
    network: options.network as any,
  };

  return createWalletJWT(payload, options?.privateKey);
};

export const handleSignStructuredDataRequest = async (
  options: SignedOptionsWithOnHandlers<StructuredSignatureRequestOptions>
) => {
  try {
    const token = await generateSignStructuredDataPayload({
      message: options.message,
      domain: options.domain,
      privateKey: options.privateKey,
      stxAddress: options.stxAddress,
      authOrigin: options.authOrigin,
      appDetails: options.appDetails,
      network: options.network,
    });
    // TODO: openSignStructuredDataPopup when hiro fixes implementation
    return openSignMessagePopup({
      token,
      onFinish: options.onFinish,
      onCancel: options.onCancel,
    });
  } catch (e: unknown) {
    console.error(`[micro-stacks] handleSignStructuredDataRequest failed`);
    console.error(e);
  }
};
