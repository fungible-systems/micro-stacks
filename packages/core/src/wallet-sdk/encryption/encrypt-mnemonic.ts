import { concatByteArrays } from 'micro-stacks/common';
import { mnemonicToEntropy, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

// micro-stacks/crypto
import { getRandomBytes } from 'micro-stacks/crypto';
import { aes128CbcEncrypt } from 'micro-stacks/crypto-aes';
import { hmacSha256 } from 'micro-stacks/crypto-hmac-sha';
import { createPbkdf2 } from 'micro-stacks/crypto-pbkdf2';

/**
 * Encrypt a raw mnemonic phrase to be password protected
 * This should always be used in combination with a library like Argon, eg `argon2-browser`
 *
 * @param {string} mnemonic - Raw mnemonic phrase
 * @param {string} password - Password to encrypt mnemonic with
 * @param {Uint8Array} salt - optional salt
 * @return {Promise<Uint8Array>} The encrypted phrase
 * @private
 * @ignore
 * */
export async function encryptMnemonic(
  mnemonic: string,
  password: string,
  salt: Uint8Array = getRandomBytes(16)
): Promise<Uint8Array> {
  if (!validateMnemonic(mnemonic, wordlist)) throw new Error('Not a valid bip39 mnemonic');
  const pbkdf2 = await createPbkdf2();
  const mnemonicEntropy = mnemonicToEntropy(mnemonic, wordlist);
  const keysAndIV = await pbkdf2.derive(password, salt, 100000, 48, 'sha512');
  const encKey = keysAndIV.slice(0, 16);
  const macKey = keysAndIV.slice(16, 32);
  const iv = keysAndIV.slice(32, 48);
  const cipherText = await aes128CbcEncrypt(iv, encKey, mnemonicEntropy);
  const hmacPayload = concatByteArrays([salt, cipherText]);
  const hmacDigest = hmacSha256(macKey, hmacPayload);
  return concatByteArrays([salt, hmacDigest, cipherText]);
}
