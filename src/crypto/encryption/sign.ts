import { getPublicKey as getPublicKeyFromPrivate, verify, sign } from '@noble/secp256k1';
import { bytesToHex, arrayBufferToUint8, utf8ToBytes } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';

/**
 * Sign content using ECDSA
 *
 * @param {String} privateKey - secp256k1 private key hex string
 * @param {Object} content - content to sign
 * @return {Object} contains:
 * signature - Hex encoded DER signature
 * public key - Hex encoded private string taken from privateKey
 * @private
 * @ignore
 */
interface SignECDSA {
  privateKey: string;
  contents: string | ArrayBuffer | Uint8Array;
}

interface SignedResponse {
  signature: string;
  publicKey: string;
}

export async function signECDSA(params: SignECDSA): Promise<SignedResponse> {
  const { contents, privateKey } = params;

  const contentBuffer =
    contents instanceof ArrayBuffer
      ? arrayBufferToUint8(contents)
      : typeof contents === 'string'
      ? utf8ToBytes(contents)
      : contents;

  const publicKey = bytesToHex(getPublicKeyFromPrivate(privateKey, true));
  const contentsHash = hashSha256(contentBuffer);
  const signature = await sign(contentsHash, privateKey, {
    // whether a signature s should be no more than 1/2 prime order.
    // true makes signatures compatible with libsecp256k1
    // false makes signatures compatible with openssl <-- stacks currently uses this
    canonical: false,
    // https://github.com/paulmillr/noble-secp256k1#signmsghash-privatekey
    // additional entropy k' for deterministic signature, follows section 3.6 of RFC6979. When true, it would automatically be filled with 32 bytes of cryptographically secure entropy
    // TODO: how can we make this default true?
    // extraEntropy: true,
  });

  return {
    signature: bytesToHex(signature),
    publicKey,
  };
}

/**
 * Verify content using ECDSA
 * @param {String | Buffer} content - Content to verify was signed
 * @param {String} publicKey - secp256k1 private key hex string
 * @param {String} signature - Hex encoded DER signature
 * @param {Boolean} strict - whether a signature s should be no more than 1/2 prime order. true makes signatures compatible with libsecp256k1, false makes signatures compatible with openssl
 * @return {Boolean} returns true when signature matches publickey + content, false if not
 * @private
 * @ignore
 */
interface VerifyESDSA {
  contents: string | ArrayBuffer | Uint8Array;
  publicKey: string;
  signature: string;
}

export function verifyECDSA(params: VerifyESDSA, strict = false): boolean {
  const { contents, publicKey, signature } = params;

  const contentBuffer =
    contents instanceof ArrayBuffer
      ? arrayBufferToUint8(contents)
      : typeof contents === 'string'
      ? utf8ToBytes(contents)
      : contents;

  const contentHash = hashSha256(contentBuffer);
  return verify(
    signature,
    contentHash,
    publicKey,
    // TODO: should this be true by default?
    // is not compat with legacy implementations.
    // change reflected here https://github.com/paulmillr/noble-secp256k1/releases/tag/1.4.0
    { strict }
  );
}
