import { Json } from './types';
import { createSigningInput } from './create-signing-input';

export function createUnsecuredToken(payload: Json) {
  const header = { typ: 'JWT', alg: 'none' };
  return createSigningInput(payload, header) + '.';
}
