import {
  decodeToken,
  TokenInterface,
  TokenVerifier,
  publicKeyToStxAddress,
} from 'micro-stacks/crypto';

/**
 * Verifies a profile token
 * @param {String} token - the token to be verified
 * @param {String} publicKeyOrAddress - the public key or address of the
 *   keypair that is thought to have signed the token
 * @returns {Object} - the verified, decoded profile token
 * @throws {Error} - throws an error if token verification fails
 */
export function verifyProfileToken(token: string, publicKeyOrAddress: string): TokenInterface {
  const decodedToken = decodeToken(token);
  if (!decodedToken) throw Error('no decoded token');

  const payload = decodedToken.payload;
  if (typeof payload === 'string') {
    throw new Error('Unexpected token payload type of string');
  }

  // Inspect and verify the subject
  if (payload.hasOwnProperty('subject') && payload.subject) {
    if (!payload.subject.hasOwnProperty('publicKey')) {
      throw new Error("Token doesn't have a subject public key");
    }
  } else {
    throw new Error("Token doesn't have a subject");
  }

  // Inspect and verify the issuer
  if (payload.hasOwnProperty('issuer') && payload.issuer) {
    if (!payload.issuer.hasOwnProperty('publicKey')) {
      throw new Error("Token doesn't have an issuer public key");
    }
  } else {
    throw new Error("Token doesn't have an issuer");
  }

  // Inspect and verify the claim
  if (!payload.hasOwnProperty('claim')) {
    throw new Error("Token doesn't have a claim");
  }

  const issuerPublicKey = (payload.issuer as Record<string, string>).publicKey;
  const address = publicKeyToStxAddress(issuerPublicKey);

  if (publicKeyOrAddress === issuerPublicKey) {
    // pass
  } else if (publicKeyOrAddress === address) {
    // pass
  } else {
    throw new Error('Token issuer public key does not match the verifying value');
  }

  const tokenVerifier = new TokenVerifier(decodedToken.header.alg as string, issuerPublicKey);
  if (!tokenVerifier) {
    throw new Error('Invalid token verifier');
  }

  const tokenVerified = tokenVerifier.verify(token);
  if (!tokenVerified) {
    throw new Error('Token verification failed');
  }

  return decodedToken;
}

/**
 * Extracts a profile from an encoded token and optionally verifies it,
 * if `publicKeyOrAddress` is provided.
 *
 * @param {String} token - the token to be extracted
 * @param {String} publicKeyOrAddress - the public key or address of the
 *   keypair that is thought to have signed the token
 * @returns {Object} - the profile extracted from the encoded token
 * @throws {Error} - if the token isn't signed by the provided `publicKeyOrAddress`
 */

export function extractProfile(
  token: string,
  publicKeyOrAddress: string | null = null
): Record<string, any> {
  const decodedToken = publicKeyOrAddress
    ? verifyProfileToken(token, publicKeyOrAddress)
    : decodeToken(token);

  if (decodedToken && decodedToken.hasOwnProperty('payload')) {
    const payload = decodedToken.payload;
    if (typeof payload === 'string')
      throw new Error('[micro-stacks] extractProfile: Unexpected token payload type of string');
    if (payload.hasOwnProperty('claim')) return payload.claim as object;
  }
  return {};
}
