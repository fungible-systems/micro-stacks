import { getSharedSecret } from 'noble-secp256k1';
import { hexToBytes, base64ToBytes, concatByteArrays } from 'micro-stacks/common';
import { aes256CbcDecrypt } from 'micro-stacks/crypto-aes';
import { sharedSecretToKeys } from '../common/shared-secret';
import { hmacSha256 } from 'micro-stacks/crypto-hmac-sha';

import type { DecryptECIESOptions } from '../common/types';

export function equalConstTime(b1: Uint8Array, b2: Uint8Array) {
  if (b1.length !== b2.length) {
    return false;
  }
  let res = 0;
  for (let i = 0; i < b1.length; i++) {
    res |= b1[i] ^ b2[i]; // jshint ignore:line
  }
  return res === 0;
}

/**
 * Decrypt content encrypted using ECIES
 *  * @param options {DecryptECIESOptions}
 *  iv (initialization vector), cipherText (cipher text),
 *  mac (message authentication code), ephemeralPublicKey
 *  wasString (boolean indicating with or not to return a byte array or string on decrypt)
 * @return plaintext
 * @throws {Error} if unable to decrypt
 * @private
 * @ignore
 */

export async function decryptECIES(options: DecryptECIESOptions): Promise<Uint8Array | string> {
  const { privateKey, cipherObject } = options;

  if (!cipherObject.ephemeralPK) throw Error('No ephemeralPK found in cipher object');
  const ephemeralPK = cipherObject.ephemeralPK;
  let sharedSecret = hexToBytes(getSharedSecret(privateKey, ephemeralPK, true) as string);
  // Trim the compressed mode prefix byte
  sharedSecret = sharedSecret.slice(1);
  const sharedKeys = sharedSecretToKeys(sharedSecret);
  const ivBuffer = hexToBytes(cipherObject.iv);

  let cipherTextBuffer: Uint8Array;

  if (!cipherObject.cipherTextEncoding || cipherObject.cipherTextEncoding === 'hex') {
    cipherTextBuffer = hexToBytes(cipherObject.cipherText);
  } else if (cipherObject.cipherTextEncoding === 'base64') {
    cipherTextBuffer = base64ToBytes(cipherObject.cipherText);
  } else {
    throw new Error(`Unexpected cipherTextEncoding "${cipherObject.cipherText}"`);
  }

  const macData = concatByteArrays([ivBuffer, hexToBytes(ephemeralPK), cipherTextBuffer]);
  const actualMac = await hmacSha256(sharedKeys.hmacKey, macData);
  const expectedMac = hexToBytes(cipherObject.mac);

  if (!equalConstTime(expectedMac, actualMac)) {
    throw new Error('Decryption failed: failure in MAC check');
  }
  const plainText = await aes256CbcDecrypt(ivBuffer, sharedKeys.encryptionKey, cipherTextBuffer);

  if (cipherObject.wasString) {
    return new TextDecoder().decode(plainText);
  } else {
    return plainText;
  }
}
