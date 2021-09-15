/**
 * @jest-environment node
 */

import { decryptContent, encryptContent, verifyECDSA } from 'micro-stacks/crypto';
import { bytesToHex } from 'micro-stacks/common';
import * as noble from 'noble-secp256k1';
import type { SignedCipherObject } from 'micro-stacks/crypto';
import {
  encryptContent as legacy_encryptContent,
  decryptContent as legacy_decryptContent,
  verifyECDSA as legacy_verifyECDSA,
} from '@stacks/encryption';

it('Will throw if no keys passed', async () => {
  const original = 'hello world';

  await expect(
    encryptContent(original, {
      wasString: true,
    })
  ).rejects.toThrow();
});

test('Encrypt content and decrypt content with no wasString passed', async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());
  const publicKey = noble.getPublicKey(privateKey, true);

  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    publicKey,
    privateKey,
  });

  const decrypted = await decryptContent(cipherObject, {
    privateKey,
  });

  expect(original).toEqual(decrypted);
});

test('Encrypt content and decrypt content with only private key passed', async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());

  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    privateKey,
  });

  const decrypted = await decryptContent(cipherObject, {
    privateKey,
  });

  expect(original).toEqual(decrypted);
});

test('Encrypt content and decrypt content with private key passed as sign', async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());

  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    privateKey,
    sign: privateKey,
  });

  expect(cipherObject).toBeTruthy();
});

test('Encrypt content and decrypt content', async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());
  const publicKey = noble.getPublicKey(privateKey, true);

  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    publicKey,
    privateKey,
    wasString: true,
  });

  const decrypted = await decryptContent(cipherObject, {
    privateKey,
  });

  expect(original).toEqual(decrypted);
});

test(`Encrypt and decrypted signed`, async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());
  const publicKey = noble.getPublicKey(privateKey, true);
  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    publicKey,
    privateKey,
    wasString: true,
    sign: true,
  });

  const { cipherText, ...signedCipherObject }: SignedCipherObject = JSON.parse(cipherObject);

  const verified = verifyECDSA({
    contents: cipherText,
    ...signedCipherObject,
  });
  const decrypted = await decryptContent(cipherText, { privateKey });

  expect(verified).toEqual(true);
  expect(decrypted).toEqual(original);
});

test(`[legacy] encrypt signed can be decrypted by micro-stacks`, async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());
  const publicKey = noble.getPublicKey(privateKey, true);
  const original = 'hello world';

  const cipherObject = await legacy_encryptContent(original, {
    publicKey,
    privateKey,
    wasString: true,
    sign: true,
  });

  const { cipherText, ...signedCipherObject }: SignedCipherObject = JSON.parse(cipherObject);

  const verified = verifyECDSA({
    contents: cipherText,
    ...signedCipherObject,
  });

  const decrypted = await decryptContent(cipherText, { privateKey });

  expect(verified).toEqual(true);
  expect(decrypted).toEqual(original);
});

test(`[legacy] decrypt and signed from micro-stacks`, async () => {
  const privateKey = bytesToHex(noble.utils.randomPrivateKey());
  const publicKey = noble.getPublicKey(privateKey, true);
  const original = 'hello world';

  const cipherObject = await encryptContent(original, {
    publicKey,
    privateKey,
    wasString: true,
    sign: true,
  });

  const { cipherText, ...signedCipherObject }: SignedCipherObject = JSON.parse(cipherObject);

  const verified = legacy_verifyECDSA(
    cipherText,
    signedCipherObject.publicKey,
    signedCipherObject.signature
  );
  const decrypted = await legacy_decryptContent(cipherText, { privateKey });

  expect(verified).toEqual(true);
  expect(decrypted).toEqual(original);
});
