import base64url from './base64url';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { sign } from 'noble-secp256k1';
import { derToJoseES256 } from './ecdsa-sig-formatter';
import { Json, SignedToken } from './types';
import { createSigningInput } from './create-signing-input';
import { MissingParametersError, utf8ToBytes } from 'micro-stacks/common';

export class TokenSigner {
  tokenType: string;
  rawPrivateKey: string;

  constructor(signingAlgorithm = 'ES256K', rawPrivateKey: string) {
    if (!rawPrivateKey)
      throw new MissingParametersError('TokenSigner: rawPrivateKey is required to sign a token');

    this.tokenType = 'JWT';
    this.rawPrivateKey = rawPrivateKey;
  }

  header(header = {}) {
    const defaultHeader = {
      typ: this.tokenType,
      alg: 'ES256K',
    };
    return {
      ...defaultHeader,
      ...header,
    };
  }

  async sign(payload: Json): Promise<string>;
  async sign(payload: Json, expanded: true, customHeader?: Json): Promise<SignedToken>;
  async sign(payload: Json, expanded: false, customHeader?: Json): Promise<string>;
  async sign(
    payload: Json,
    expanded = false,
    customHeader: Json = {}
  ): Promise<SignedToken | string> {
    // generate the token header
    const header = this.header(customHeader as any);

    // prepare the message to be signed
    const signingInput = createSigningInput(payload, header);
    const signingInputHash = hashSha256(utf8ToBytes(signingInput));
    return this.createWithSignedHash(payload, expanded, header, signingInput, signingInputHash);
  }

  async createWithSignedHash(
    payload: Json,
    expanded: boolean,
    header: { typ: string; alg: string },
    signingInput: string,
    signingInputHash: Uint8Array
  ): Promise<SignedToken | string> {
    const sig = await sign(signingInputHash, this.rawPrivateKey);
    const formatted: string = derToJoseES256(sig);

    if (expanded) {
      const signedToken: SignedToken = {
        header: [base64url.encode(JSON.stringify(header))],
        payload: JSON.stringify(payload),
        signature: [formatted],
      };
      return signedToken;
    } else {
      return [signingInput, formatted].join('.');
    }
  }
}
