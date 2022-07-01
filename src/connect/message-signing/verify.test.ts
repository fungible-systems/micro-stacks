import { bytesToHex, hexToBytes } from 'micro-stacks/common';
import { tupleCV, cvToHex, uintCV } from 'micro-stacks/clarity';
import { verifyMessageSignature, extractSignatureParts } from './verify';
import { hashMessage } from './encoding';

describe('Verify messages (VRS mode)', () => {
  // from the wallet
  const payload = {
    signature:
      '007db2f251643ff11493ae377db2581a55b5dcce11a9b79becc177dc97a2fb6932076bd197a8e3772eab317d95a1c78f60adfcbf8e1512357c3f95d6606ad7dd29',
    publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
  };
  const message = cvToHex(tupleCV({ hello: uintCV(100) })).replace('0x', '');

  test(verifyMessageSignature.name, () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        mode: 'vrs',
      })
    ).toEqual(true);
  });
  test(verifyMessageSignature.name, () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        publicKey: payload.publicKey,
      })
    ).toBe(true);
  });

  test(extractSignatureParts.name, () => {
    expect(
      bytesToHex(
        extractSignatureParts({
          hash: hashMessage(message),
          signature: payload.signature,
          mode: 'vrs',
        }).publicKey
      )
    ).toEqual(payload.publicKey);
  });
});

describe('Verify messages (RVS mode)', () => {
  const message = 'hi there how are you';
  // from the wallet
  const payload = {
    signature:
      '0c956388e3bf84a2873b2fdd9c6845cceb14cea0e342bdc233dbc25e32e84aa77d483f80160541c92bf3d48beed82dcbea58c3d3f93d7cbc3fbefdbd48cecf2e01',
    publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
  };

  test(verifyMessageSignature.name, () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
      })
    ).toEqual(true);
  });
  test(verifyMessageSignature.name, () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        publicKey: payload.publicKey,
      })
    ).toBe(true);
  });

  test(extractSignatureParts.name, () => {
    expect(
      bytesToHex(
        extractSignatureParts({
          hash: hashMessage(message),
          signature: payload.signature,
        }).publicKey
      )
    ).toEqual(payload.publicKey);
  });
});

describe('SIP-018 test paths', () => {
  test('Can verify signed structured data (RSV mode)', () => {
    // Generated with:
    // npm run sign-test-ascii 753b7cc01a1a2e86221266a154af739463fce51219d97e4f856cd7200c3bd2a601 "Hello World" "Dapp Name" 1
    const structuredDataHash = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
    const signature =
      'adf75475bef12f6d5b79b4495df307f75c608133bbe456442071a7d797fbf971120cd46d367cebdb284dd32efa135ed977e36ba30377adec04d0d9622cbd1ea201';
    const valid = verifyMessageSignature({
      message: hexToBytes(structuredDataHash),
      signature,
      mode: 'rsv',
    });
    expect(valid).toBe(true);
  });

  test('Rejects structured data with invalid signatures', () => {
    const structuredDataHash = '5297eef9765c466d945ad1cb2c81b30b9fed6c165575dc9226e9edf78b8cd9e8';
    const signature =
      '0000000000f12f6d5b79b4495df307f75c608133bbe456442071a7d797fbf971120cd46d367cebdb284dd32efa135ed977e36ba30377adec04d0d9622cbd1ea201';
    const valid = verifyMessageSignature({
      message: hexToBytes(structuredDataHash),
      signature,
      mode: 'rsv',
    });
    expect(valid).toBe(false);
  });
});
