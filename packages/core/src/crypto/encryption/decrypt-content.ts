import { decryptECIES } from './decrypt-ecies';

/**
 * Decrypts data encrypted with `encryptContent` with the
 * transit private key.
 * @param content - encrypted content.
 * @param {Object} [options=null] - options object
 * @param {String} options.privateKey - the hex string of the ECDSA private
 * key to use for decryption. If not provided, will use user's appPrivateKey.
 * @return decrypted content.
 */
export function decryptContent(
  content: string,
  options: {
    privateKey: string;
  }
): Promise<string | Uint8Array> {
  if (!options.privateKey) {
    throw new Error('Private key is required for decryption.');
  }

  try {
    const cipherObject = JSON.parse(content);
    return decryptECIES({
      privateKey: options.privateKey,
      cipherObject,
    });
  } catch (err) {
    if (err instanceof SyntaxError)
      throw new Error(
        'Failed to parse encrypted content JSON. The content may not ' +
          'be encrypted. If using getFile, try passing { decrypt: false }.'
      );
    throw err;
  }
}
