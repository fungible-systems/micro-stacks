import { Json } from './types';
import base64url from './base64url';

export function createSigningInput(payload: Json, header: Json) {
  const tokenParts = [];

  // add in the header
  const encodedHeader = base64url.encode(JSON.stringify(header));
  tokenParts.push(encodedHeader);

  // add in the payload
  const encodedPayload = base64url.encode(JSON.stringify(payload));
  tokenParts.push(encodedPayload);

  // prepare the message
  const signingInput = tokenParts.join('.');

  // return the signing input
  return signingInput;
}
