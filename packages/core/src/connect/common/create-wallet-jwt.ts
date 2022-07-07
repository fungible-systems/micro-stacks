import { createUnsecuredToken, Json, TokenSigner } from 'micro-stacks/crypto';

export const createWalletJWT = (payload: Json, privateKey?: string) => {
  if (!privateKey) return createUnsecuredToken(payload);
  const signer = new TokenSigner('ES256k', privateKey);
  return signer.sign(payload);
};
