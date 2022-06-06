import { Json, TokenSigner } from 'micro-stacks/crypto';
import { createUnsecuredToken } from 'jsontokens';

export const createWalletJWT = (payload: Json, privateKey?: string) => {
  if (!privateKey) return createUnsecuredToken(payload);
  const signer = new TokenSigner('ES256k', privateKey);
  return signer.sign(payload);
};
