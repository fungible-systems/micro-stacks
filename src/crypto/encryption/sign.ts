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

  const publicKey = getPublicKeyFromPrivate(privateKey, true);
  const contentsHash = hashSha256(contentBuffer);
  const signature = await sign(contentsHash, privateKey);

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
 * @return {Boolean} returns true when signature matches publickey + content, false if not
 * @private
 * @ignore
 */
interface VerifyESDSA {
  contents: string | ArrayBuffer | Uint8Array;
  publicKey: string;
  signature: string;
}

export function verifyECDSA(params: VerifyESDSA): boolean {
  const { contents, publicKey, signature } = params;

  const contentBuffer =
    contents instanceof ArrayBuffer
      ? arrayBufferToUint8(contents)
      : typeof contents === 'string'
      ? utf8ToBytes(contents)
      : contents;

  const contentHash = hashSha256(contentBuffer);
  return verify(signature, contentHash, publicKey);
}
