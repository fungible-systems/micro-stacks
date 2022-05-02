import { parseRecoverableSignature } from 'micro-stacks/transactions';
import { recoverPublicKey, Signature, verify } from '@noble/secp256k1';
import { hexToBigInt } from 'micro-stacks/common';

export const verifySignedMessage = (
  hash: string,
  recoverableSignature: string,
  mode = 'vrs' as 'vrs' | 'rsv'
) => {
  const recovery = parseRecoverableSignature(recoverableSignature, mode);
  const publicKey = recoverPublicKey(
    hash,
    new Signature(hexToBigInt(recovery.r), hexToBigInt(recovery.s)),
    recovery.recoveryParam,
    true
  );
  const signature = new Signature(hexToBigInt(recovery.r), hexToBigInt(recovery.s));
  return verify(signature, hash, publicKey);
};
