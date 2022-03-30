import { getPublicKey, getSharedSecret, utils } from '@noble/secp256k1';
import { bytesToHex, bytesToBase64, concatByteArrays } from 'micro-stacks/common';
import { getRandomBytes } from '../common/random-bytes';

import type { CipherObject, EncryptECIESOptions } from '../common/types';
import { aes256CbcEncrypt } from 'micro-stacks/crypto-aes';
import { sharedSecretToKeys } from '../common/shared-secret';
import { hmacSha256 } from 'micro-stacks/crypto-hmac-sha';

/**
 * Encrypt content to elliptic curve publicKey using ECIES
 * @return Object containing:
 *  iv (initialization vector, hex encoding),
 *  cipherText (cipher text either hex or base64 encoded),
 *  mac (message authentication code, hex encoded),
 *  ephemeral public key (hex encoded),
 *  wasString (boolean indicating with or not to return a buffer or string on decrypt)
 * @see https://cryptobook.nakov.com/asymmetric-key-ciphers/ecies-public-key-encryption
 */
export async function encryptECIES(options: EncryptECIESOptions): Promise<CipherObject> {
  const { publicKey, content, cipherTextEncoding = 'hex', wasString } = options;
  const ephemeralPrivateKey = utils.randomPrivateKey();
  const ephemeralPublicKey = getPublicKey(ephemeralPrivateKey, true);

  let sharedSecret = getSharedSecret(ephemeralPrivateKey, publicKey, true) as Uint8Array;

  // Trim the compressed mode prefix byte
  sharedSecret = sharedSecret.slice(1);
  const sharedKeys = sharedSecretToKeys(sharedSecret);
  const initializationVector = getRandomBytes(16);

  const cipherText = await aes256CbcEncrypt(
    initializationVector,
    sharedKeys.encryptionKey,
    content
  );

  const macData = concatByteArrays([initializationVector, ephemeralPublicKey, cipherText]);
  const mac = hmacSha256(sharedKeys.hmacKey, macData);

  let cipherTextString: string;

  if (!cipherTextEncoding || cipherTextEncoding === 'hex') {
    cipherTextString = bytesToHex(cipherText);
  } else if (cipherTextEncoding === 'base64') {
    cipherTextString = bytesToBase64(cipherText);
  } else {
    throw new Error(`Unexpected cipherTextEncoding "${cipherTextEncoding}"`);
  }

  const result: CipherObject = {
    iv: bytesToHex(initializationVector),
    ephemeralPK: bytesToHex(ephemeralPublicKey),
    cipherText: cipherTextString,
    mac: bytesToHex(mac),
    wasString,
  };

  if (cipherTextEncoding && cipherTextEncoding !== 'hex') {
    result.cipherTextEncoding = cipherTextEncoding;
  }

  return result;
}
