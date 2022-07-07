import { Json, TokenSigner } from 'micro-stacks/crypto';
import { Person } from 'schema-dts';

export const signProfileUpdatePayload = async (
  payload: { profile: Person },
  privateKey: string
) => {
  const signer = new TokenSigner('ES256k', privateKey);
  return signer.sign({
    ...payload,
  } as unknown as Json);
};
