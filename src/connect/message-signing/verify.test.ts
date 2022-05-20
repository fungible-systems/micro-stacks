import { bytesToHex } from 'micro-stacks/common';
import { hashSha256 } from 'micro-stacks/crypto-sha';
import { utf8ToBytes } from '@noble/hashes/utils';
import { cvToHex, uintCV } from '@stacks/transactions';
import { tupleCV } from 'micro-stacks/clarity';
import { verifySignedMessage } from './verify';

describe('Verify messages', () => {
  test(verifySignedMessage.name, () => {
    // from the wallet
    const payload = {
      signature:
        '007db2f251643ff11493ae377db2581a55b5dcce11a9b79becc177dc97a2fb6932076bd197a8e3772eab317d95a1c78f60adfcbf8e1512357c3f95d6606ad7dd29',
      // seems wrong
      publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
    };

    const hash = bytesToHex(hashSha256(utf8ToBytes(cvToHex(tupleCV({ hello: uintCV(100) })))));
    const valid = verifySignedMessage(hash, payload.signature);
    expect(valid).toBe(true);
  });

  test('Can verify signed structured data (RSV mode)', () => {
    // Generated with:
    // npm run sign-test-ascii 753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601 "Hello World" "Dapp Name" 1
    const structuredDataHash = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
    const signature =
      'adf75475bef12f6d5b79b4495df307f75c608133bbe456442071a7d797fbf971120cd46d367cebdb284dd32efa135ed977e36ba30377adec04d0d9622cbd1ea201';
    const valid = verifySignedMessage(structuredDataHash, signature, 'rsv');
    expect(valid).toBe(true);
  });

  test('Rejects structured data with invalid signatures', () => {
    const structuredDataHash = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
    const signature =
      '0000000000f12f6d5b79b4495df307f75c608133bbe456442071a7d797fbf971120cd46d367cebdb284dd32efa135ed977e36ba30377adec04d0d9622cbd1ea201';
    const valid = verifySignedMessage(structuredDataHash, signature, 'rsv');
    expect(valid).toBe(false);
  });
});
