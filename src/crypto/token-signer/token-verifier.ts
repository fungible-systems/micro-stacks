import { verify } from '@noble/secp256k1';
import { base64ToBytes, bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import base64url from './base64url';
import { joseToDerES256 } from './ecdsa-sig-formatter';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import type { SignedToken } from './types';

export class TokenVerifier {
  tokenType: string;
  rawPublicKey: string;

  constructor(signingAlgorithm: string, rawPublicKey: string) {
    this.tokenType = 'JWT';
    this.rawPublicKey = rawPublicKey;
  }

  verify(
    token: string | SignedToken,
    // @param {Boolean} strict - whether a signature s should be no more than 1/2 prime order.
    // true makes signatures compatible with libsecp256k1, false makes signatures compatible with openssl
    strict = false
  ): boolean {
    if (typeof token === 'string') {
      return this.verifyCompact(token, strict);
    } else if (typeof token === 'object') {
      return this.verifyExpanded(token, strict);
    } else {
      return false;
    }
  }

  verifyCompact(token: string, strict?: boolean): boolean {
    // decompose the token into parts
    const tokenParts = token.split('.');

    // calculate the signing input hash
    const signingInput = tokenParts[0] + '.' + tokenParts[1];

    const performVerify = (signingInputHash: Uint8Array) => {
      const signature = tokenParts[2];
      // extract the signature as a DER array
      const formatted: string = joseToDerES256(signature);
      // verify the signed hash
      return verify(
        bytesToHex(base64ToBytes(formatted)),
        bytesToHex(signingInputHash),
        this.rawPublicKey,
        {
          // TODO: this should be true default
          // is not compat with legacy tokens.
          // change reflected here https://github.com/paulmillr/noble-secp256k1/releases/tag/1.4.0
          strict,
        }
      );
    };

    const signingInputHash = hashSha256(utf8ToBytes(signingInput));
    return performVerify(signingInputHash);
  }

  verifyExpanded(token: SignedToken, strict?: boolean): boolean {
    const signingInput = [token['header'].join('.'), base64url.encode(token['payload'])].join('.');
    let verified = true;

    const performVerify = (signingInputHash: Uint8Array) => {
      token['signature'].map((signature: string) => {
        const formatted: string = joseToDerES256(signature);

        const signatureVerified = verify(
          bytesToHex(base64ToBytes(formatted)),
          bytesToHex(signingInputHash),
          this.rawPublicKey,
          {
            strict,
          }
        );
        if (!signatureVerified) {
          verified = false;
        }
      });
      return verified;
    };

    const signingInputHash = hashSha256(utf8ToBytes(signingInput));
    return performVerify(signingInputHash);
  }
}
