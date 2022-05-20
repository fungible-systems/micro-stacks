import { parseRecoverableSignature } from 'micro-stacks/transactions';
import { recoverPublicKey, Signature, verify } from '@noble/secp256k1';
import { hexToBigInt } from 'micro-stacks/common';
import { hashMessage } from './encoding';

export const extractSignatureParts = (options: {
  // sha256 hash
  hash: string | Uint8Array;
  signature: string;
  mode?: 'vrs' | 'rsv';
}) => {
  const { hash, signature, mode = 'vrs' } = options;
  const recovery = parseRecoverableSignature(signature, mode);
  const publicKey = recoverPublicKey(
    hash,
    new Signature(hexToBigInt(recovery.r), hexToBigInt(recovery.s)),
    recovery.recoveryParam,
    true
  );
  return {
    signature: new Signature(hexToBigInt(recovery.r), hexToBigInt(recovery.s)),
    publicKey,
    recoveryBytes: recovery.recoveryParam,
  };
};

export const verifyMessageSignature = (options: {
  // string = message, bytes = hash
  message: string | Uint8Array;
  signature: string;
  publicKey?: string;
  mode?: 'vrs' | 'rsv';
}) => {
  const { message, signature, mode = 'vrs', publicKey } = options;
  try {
    const hash = typeof message === 'string' ? hashMessage(message) : message;

    const recovery = extractSignatureParts({
      hash,
      signature,
      mode,
    });

    return verify(recovery.signature, hash, publicKey ?? recovery.publicKey);
  } catch (e) {
    return false;
  }
};
