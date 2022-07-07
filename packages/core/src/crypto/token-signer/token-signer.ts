import base64url from './base64url';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { sign, signSync } from '@noble/secp256k1';
import { derToJoseES256 } from './ecdsa-sig-formatter';
import { Json, SignedToken } from './types';
import { createSigningInput } from './create-signing-input';
import { MissingParametersError, utf8ToBytes } from 'micro-stacks/common';

export class TokenSigner {
  tokenType: string;
  rawPrivateKey: string;

  constructor(_signingAlgorithm = 'ES256K', rawPrivateKey: string) {
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
    const header = this.header(customHeader as unknown as {});

    // prepare the message to be signed
    const signingInput = createSigningInput(payload, header);
    const signingInputHash = hashSha256(utf8ToBytes(signingInput));
    return this.createWithSignedHash(payload, expanded, header, signingInput, signingInputHash);
  }

  signSync(payload: Json): string;
  signSync(payload: Json, expanded: true, customHeader?: Json): SignedToken;
  signSync(payload: Json, expanded: false, customHeader?: Json): string;
  signSync(payload: Json, expanded = false, customHeader: Json = {}): SignedToken | string {
    // generate the token header
    const header = this.header(customHeader as unknown as {});

    // prepare the message to be signed
    const signingInput = createSigningInput(payload, header);
    const signingInputHash = hashSha256(utf8ToBytes(signingInput));
    return this.createWithSignedHashSync(payload, expanded, header, signingInput, signingInputHash);
  }

  async createWithSignedHash(
    payload: Json,
    expanded: boolean,
    header: { typ: string; alg: string },
    signingInput: string,
    signingInputHash: Uint8Array
  ): Promise<SignedToken | string> {
    const sig = await sign(signingInputHash, this.rawPrivateKey, {
      // whether a signature s should be no more than 1/2 prime order.
      // true makes signatures compatible with libsecp256k1
      // false makes signatures compatible with openssl <-- stacks currently uses this
      canonical: false,
      // https://github.com/paulmillr/noble-secp256k1#signmsghash-privatekey
      // additional entropy k' for deterministic signature, follows section 3.6 of RFC6979. When true, it would automatically be filled with 32 bytes of cryptographically secure entropy
      // TODO: how can we make this default true?
      // extraEntropy: false,
    });
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

  createWithSignedHashSync(
    payload: Json,
    expanded: boolean,
    header: { typ: string; alg: string },
    signingInput: string,
    signingInputHash: Uint8Array
  ): SignedToken | string {
    const sig = signSync(signingInputHash, this.rawPrivateKey, {
      // whether a signature s should be no more than 1/2 prime order.
      // true makes signatures compatible with libsecp256k1
      // false makes signatures compatible with openssl <-- stacks currently uses this
      canonical: false,
      // https://github.com/paulmillr/noble-secp256k1#signmsghash-privatekey
      // additional entropy k' for deterministic signature, follows section 3.6 of RFC6979. When true, it would automatically be filled with 32 bytes of cryptographically secure entropy
      // TODO: how can we make this default true?
      // extraEntropy: false,
    });
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
