import { recoverPublicKey, Signature, verify } from '@noble/secp256k1';
import { bytesToHex, hexToBigInt } from 'micro-stacks/common';
import { hashMessage, LEGACY_CHAIN_PREFIX_BYTES } from './encoding';

import { getStructuredDataHashes, makeStructuredDataHash } from './structured-message';
import { StructuredSignatureRequestOptions } from './types';
import { c32addressDecode, publicKeyToStxAddress } from 'micro-stacks/crypto';

const COORDINATE_BYTES = 32;

function parseRecoverableSignatureVrs(signature: string) {
  if (signature.length < COORDINATE_BYTES * 2 * 2 + 1) {
    throw new Error('Invalid signature');
  }
  const recoveryIdHex = signature.slice(0, 2);
  const r = signature.slice(2, 2 + COORDINATE_BYTES * 2);
  const s = signature.slice(2 + COORDINATE_BYTES * 2);
  return {
    recoveryBytes: hexToBigInt(recoveryIdHex),
    r,
    s,
  };
}

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

export function signatureRsvToVrs(signature: string) {
  return signature.slice(-2) + signature.slice(0, -2);
}

export const getPublicKeyFromSignature = ({
  hash,
  signature,
  recoveryBytes,
}: {
  hash: Uint8Array;
  signature: Signature;
  recoveryBytes: number | BigInt;
}) => {
  return recoverPublicKey(hash, signature, Number(recoveryBytes), true);
};

export const recoverSignature = (options: { signature: string; mode?: 'vrs' | 'rsv' }) => {
  const { signature, mode = 'rsv' } = options;
  const { r, s, recoveryBytes } = parseRecoverableSignatureVrs(
    mode === 'rsv' ? signatureRsvToVrs(signature) : signature
  );
  const sig = new Signature(hexToBigInt(r), hexToBigInt(s));

  return {
    signature: sig,
    recoveryBytes,
  };
};

export const _verifyMessageSignature = (options: {
  // string = message, bytes = hash
  message: string | Uint8Array;
  signature: string;
  publicKey?: string;
  stxAddress?: string;
  mode?: 'vrs' | 'rsv';
  prefix?: Uint8Array;
}) => {
  if (!options.publicKey && !options.stxAddress)
    throw Error(
      '[micro-stacks/connect[ verifyMessageSignature -- You must pass `stxAddress` if you are recovering the public key from the signature'
    );

  const { message, mode = 'rsv' } = options;
  let publicKey = options.publicKey;

  try {
    const hash = typeof message === 'string' ? hashMessage(message, options.prefix) : message;
    const { signature, recoveryBytes } = recoverSignature({
      signature: options.signature,
      mode,
    });

    if (!publicKey) {
      const [version] = c32addressDecode(options.stxAddress!);

      publicKey = bytesToHex(
        getPublicKeyFromSignature({
          hash,
          signature,
          recoveryBytes,
        })
      );

      const publicKeyAddress = publicKeyToStxAddress(publicKey, version);

      if (publicKeyAddress !== options.stxAddress) {
        console.error(
          `[micro-stacks/connect] verifyMessageSignature Stacks address is not correct. expected: ${options.stxAddress}, received: ${publicKeyAddress}`
        );
        return false;
      }
    }

    // verify() is strict: true by default. High-s signatures are rejected, which mirrors libsecp behavior
    // Set verify options to strict: false, to support the legacy stacks implementations
    // Reference: https://github.com/paulmillr/noble-secp256k1/releases/tag/1.4.0
    return verify(signature, hash, publicKey, { strict: false });
  } catch (e) {
    console.error('[micro-stacks/connect] verifyMessageSignature failed', e);
    return false;
  }
};

const _verifyStructuredMessageSignature = (options: {
  message: StructuredSignatureRequestOptions['message'];
  domain: StructuredSignatureRequestOptions['domain'];
  signature: string;
  publicKey?: string;
  stxAddress?: string;
  mode?: 'vrs' | 'rsv';
  prefix?: Uint8Array;
}) => {
  if (!options.publicKey && !options.stxAddress)
    throw Error(
      '[micro-stacks/connect[ verifyStructuredMessageSignature -- You must pass `stxAddress` if you are recovering the public key from the signature'
    );

  const { domain, message } = getStructuredDataHashes({
    domain: options.domain,
    message: options.message,
  });

  const hashBytes = makeStructuredDataHash(domain, message);

  return _verifyMessageSignature({
    message: hashBytes,
    signature: options.signature,
    publicKey: options.publicKey,
    stxAddress: options.stxAddress,
    mode: options.mode,
    prefix: options.prefix,
  });
};

export const verifyMessageSignature = (options: {
  // string = message, bytes = hash
  message: string | Uint8Array;
  signature: string;
  publicKey?: string;
  stxAddress?: string;
  mode?: 'vrs' | 'rsv';
}) => {
  return (
    _verifyMessageSignature(options) ||
    _verifyMessageSignature({
      ...options,
      prefix: LEGACY_CHAIN_PREFIX_BYTES,
    })
  );
};

export const verifyStructuredMessageSignature = (options: {
  message: StructuredSignatureRequestOptions['message'];
  domain: StructuredSignatureRequestOptions['domain'];
  signature: string;
  publicKey?: string;
  stxAddress?: string;
  mode?: 'vrs' | 'rsv';
}) => {
  return (
    _verifyStructuredMessageSignature(options) ||
    _verifyStructuredMessageSignature({
      ...options,
      prefix: LEGACY_CHAIN_PREFIX_BYTES,
    })
  );
};
