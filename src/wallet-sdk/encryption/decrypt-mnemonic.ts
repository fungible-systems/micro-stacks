import { bytesToHex, concatByteArrays, hexToBytes } from 'micro-stacks/common';
import { entropyToMnemonic, validateMnemonic } from 'micro-stacks/bip39';
import { aes128CbcDecrypt } from 'micro-stacks/crypto-aes';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { hmacSha256 } from 'micro-stacks/crypto-hmac-sha';
import { createPbkdf2 } from 'micro-stacks/crypto-pbkdf2';

/**
 * Decrypt an encrypted mnemonic phrase with a password.
 * @param encryptedMnemonic - Uint8Array or hex-encoded string of the encrypted mnemonic
 * @param password - Password for data
 * @return the raw mnemonic phrase
 * @private
 * @ignore
 */
export async function decryptMnemonic(
  encryptedMnemonic: Uint8Array | string,
  password: string
): Promise<string> {
  const dataBuffer =
    typeof encryptedMnemonic === 'string' ? hexToBytes(encryptedMnemonic) : encryptedMnemonic;
  const salt = dataBuffer.slice(0, 16);
  const hmacSig = dataBuffer.slice(16, 48); // 32 bytes
  const cipherText = dataBuffer.slice(48);
  const hmacPayload = concatByteArrays([salt, cipherText]);
  const pbkdf2 = await createPbkdf2();

  const keysAndIV = await pbkdf2.derive(password, salt, 100000, 48, 'sha512');
  const encKey = keysAndIV.slice(0, 16);
  const macKey = keysAndIV.slice(16, 32);
  const iv = keysAndIV.slice(32, 48);

  const decryptedResult = await aes128CbcDecrypt(iv, encKey, cipherText);
  const hmacDigest = await hmacSha256(macKey, hmacPayload);

  const hmacSigHash = hashSha256(hmacSig);
  const hmacDigestHash = hashSha256(hmacDigest);

  if (bytesToHex(hmacSigHash) !== bytesToHex(hmacDigestHash))
    throw new Error('Wrong password (HMAC mismatch)');

  let mnemonic: string;
  try {
    mnemonic = await entropyToMnemonic(decryptedResult);
  } catch (error) {
    console.error('Error thrown by `entropyToMnemonic`');
    console.error(error);
    throw new Error('Wrong password (invalid plaintext)');
  }
  if (!(await validateMnemonic(mnemonic))) {
    throw new Error('Wrong password (invalid plaintext)');
  }

  return mnemonic;
}
