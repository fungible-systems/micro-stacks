import { getPublicKey } from 'noble-secp256k1';
import { publicKeyToBase58Address, verifyECDSA, decryptContent } from 'micro-stacks/crypto';
import { SignatureVerificationError } from '../gaia/errors';
import { getGaiaAddress } from './getters';

import type { GaiaHubConfig } from '../gaia/types';
import type { SignedCipherObject } from 'micro-stacks/crypto';

/**
 *  Handle signature verification and decryption for contents which are
 *  expected to be signed and encrypted. This works for single and
 *  multiplayer reads. In the case of multiplayer reads, it uses the
 *  gaia address for verification of the claimed public key.
 *
 *  @private
 */

export async function handleSignedEncryptedContents(options: {
  path: string;
  storedContents: string;
  app: string;
  privateKey?: string;
  username?: string;
  zoneFileLookupURL?: string;
  gaiaHubConfig: GaiaHubConfig;
}): Promise<string | Uint8Array> {
  const { path, storedContents, app, privateKey, username, zoneFileLookupURL, gaiaHubConfig } =
    options;
  const appPrivateKey = privateKey;

  const appPublicKey = appPrivateKey ? getPublicKey(appPrivateKey, true) : null;

  let address: string | null = null;
  if (username || gaiaHubConfig) {
    address = await getGaiaAddress({
      app,
      username,
      zoneFileLookupURL,
      gaiaHubConfig,
    });
  } else if (appPublicKey) {
    address = publicKeyToBase58Address(appPublicKey);
  }
  if (!address) {
    throw new SignatureVerificationError(
      'Failed to get gaia address for verification of: ' + `${path}`
    );
  }
  let signedCipherObject: SignedCipherObject;
  try {
    signedCipherObject = JSON.parse(storedContents);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(
        'Failed to parse encrypted, signed content JSON. The content may not ' +
          'be encrypted. If using getFile, try passing' +
          ' { verify: false, decrypt: false }.'
      );
    } else {
      throw err;
    }
  }

  const signature = signedCipherObject.signature;
  const signerPublicKey = signedCipherObject.publicKey;
  const cipherText = signedCipherObject.cipherText;
  const signerAddress = publicKeyToBase58Address(signerPublicKey);

  if (!signerPublicKey || !cipherText || !signature) {
    throw new SignatureVerificationError(
      'Failed to get signature verification data from file:' + ` ${path}`
    );
  } else if (signerAddress !== address) {
    throw new SignatureVerificationError(
      `Signer pubkey address (${signerAddress}) doesn't` + ` match gaia address (${address})`
    );
  }

  const verified = verifyECDSA({
    signature,
    contents: cipherText,
    publicKey: signerPublicKey,
  });

  if (!verified)
    throw new SignatureVerificationError(
      'Contents do not match ECDSA signature in file:' + ` ${path}`
    );

  if (!privateKey) throw Error('Private key needs to be passed in order to decrypt content');
  const decryptOpt = { privateKey };
  return decryptContent(cipherText, decryptOpt);
}
