import { CipherObject, CipherTextEncoding, SignedCipherObject } from './types';

/**
 * Calculate the AES-CBC ciphertext output byte length a given input length.
 * AES has a fixed block size of 16-bytes regardless key size.
 * @ignore
 */
export function getAesCbcOutputLength(inputByteLength: number) {
  // AES-CBC block mode rounds up to the next block size.
  const cipherTextLength = (Math.floor(inputByteLength / 16) + 1) * 16;
  return cipherTextLength;
}

/**
 * Calculate the base64 encoded string length for a given input length.
 * This is equivalent to the byte length when the string is ASCII or UTF8-8
 * encoded.
 * @param inputByteLength
 */
export function getBase64OutputLength(inputByteLength: number) {
  const encodedLength = Math.ceil(inputByteLength / 3) * 4;
  return encodedLength;
}

/**
 * Fast function that determines the final ASCII string byte length of the
 * JSON stringified ECIES encrypted payload.
 * @ignore
 */

/**
 * Get details about the JSON envelope size overhead for ciphertext payloads.
 * @ignore
 */
export function getCipherObjectWrapper(opts: {
  wasString: boolean;
  cipherTextEncoding: CipherTextEncoding;
}): {
  /** The stringified JSON string of an empty `CipherObject`. */
  payloadShell: string;
  /** Total string length of all the `CipherObject` values that always have constant lengths. */
  payloadValuesLength: number;
} {
  // Placeholder structure of the ciphertext payload, used to determine the
  // stringified JSON overhead length.
  const shell: CipherObject = {
    iv: '',
    ephemeralPK: '',
    mac: '',
    cipherText: '',
    wasString: !!opts.wasString,
  };
  if (opts.cipherTextEncoding === 'base64') {
    shell.cipherTextEncoding = 'base64';
  }
  // Hex encoded 16 byte buffer.
  const ivLength = 32;
  // Hex encoded, compressed EC pubkey of 33 bytes.
  const ephemeralPKLength = 66;
  // Hex encoded 32 byte hmac-sha256.
  const macLength = 64;
  return {
    payloadValuesLength: ivLength + ephemeralPKLength + macLength,
    payloadShell: JSON.stringify(shell),
  };
}

/**
 * Get details about the JSON envelope size overhead for signed ciphertext payloads.
 * @param payloadShell - The JSON stringified empty `CipherObject`
 * @ignore
 */
export function getSignedCipherObjectWrapper(payloadShell: string): {
  /** The stringified JSON string of an empty `SignedCipherObject`. */
  signedPayloadValuesLength: number;
  /** Total string length of all the `SignedCipherObject` values
   * that always have constant lengths */
  signedPayloadShell: string;
} {
  // Placeholder structure of the signed ciphertext payload, used to determine the
  // stringified JSON overhead length.
  const shell: SignedCipherObject = {
    signature: '',
    publicKey: '',
    cipherText: payloadShell,
  };
  // Hex encoded DER signature, up to 72 byte length.
  const signatureLength = 144;
  // Hex encoded 33 byte public key.
  const publicKeyLength = 66;
  return {
    signedPayloadValuesLength: signatureLength + publicKeyLength,
    signedPayloadShell: JSON.stringify(shell),
  };
}

export function eciesGetJsonStringLength(opts: {
  contentLength: number;
  wasString: boolean;
  sign: boolean;
  cipherTextEncoding: CipherTextEncoding;
}): number {
  const { payloadShell, payloadValuesLength } = getCipherObjectWrapper(opts);

  // Calculate the AES output length given the input length.
  const cipherTextLength = getAesCbcOutputLength(opts.contentLength);

  // Get the encoded string length of the cipherText.
  let encodedCipherTextLength: number;
  if (!opts.cipherTextEncoding || opts.cipherTextEncoding === 'hex') {
    encodedCipherTextLength = cipherTextLength * 2;
  } else if (opts.cipherTextEncoding === 'base64') {
    encodedCipherTextLength = getBase64OutputLength(cipherTextLength);
  } else {
    throw new Error(`Unexpected cipherTextEncoding "${opts.cipherTextEncoding}"`);
  }

  if (!opts.sign) {
    // Add the length of the JSON envelope, ciphertext length, and length of const values.
    return payloadShell.length + payloadValuesLength + encodedCipherTextLength;
  } else {
    // Get the signed version of the JSON envelope
    const { signedPayloadShell, signedPayloadValuesLength } =
      getSignedCipherObjectWrapper(payloadShell);
    // Add length of the JSON envelope, ciphertext length, and length of the const values.
    return (
      signedPayloadShell.length +
      signedPayloadValuesLength +
      payloadValuesLength +
      encodedCipherTextLength
    );
  }
}
