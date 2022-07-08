import { bytesToHex, ChainID } from 'micro-stacks/common';
import {
  bufferCVFromString,
  contractPrincipalCV,
  cvToHex,
  falseCV,
  intCV,
  listCV,
  noneCV,
  responseErrorCV,
  responseOkCV,
  someCV,
  standardPrincipalCV,
  stringAsciiCV,
  stringUtf8CV,
  trueCV,
  tupleCV,
  uintCV,
} from 'micro-stacks/clarity';
import {
  getPublicKeyFromSignature,
  recoverSignature,
  verifyMessageSignature,
  verifyStructuredMessageSignature,
} from './verify';
import { hashMessage } from './encoding';
import { getStructuredDataHashes, makeStructuredDataHash } from './structured-message';
import { publicKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';

describe('Verify messages (VRS mode)', () => {
  // from the wallet
  const payload = {
    signature:
      '007db2f251643ff11493ae377db2581a55b5dcce11a9b79becc177dc97a2fb6932076bd197a8e3772eab317d95a1c78f60adfcbf8e1512357c3f95d6606ad7dd29',
    publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
  };
  const stxAddress = publicKeyToStxAddress(payload.publicKey);
  const message = cvToHex(tupleCV({ hello: uintCV(100) })).replace('0x', '');

  test('can recover pk', () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        stxAddress,
        mode: 'vrs',
      })
    ).toEqual(true);
  });

  test('will fail', () => {
    expect(
      verifyMessageSignature({
        message: 'different message',
        signature: payload.signature,
        stxAddress,
        mode: 'vrs',
      })
    ).toEqual(false);
  });

  test('with passed pk', () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        publicKey: payload.publicKey,
        mode: 'vrs',
      })
    ).toBe(true);
  });

  test('wrong message vrs', () => {
    expect(
      verifyMessageSignature({
        message: 'something completely wrong',
        signature: payload.signature,
        publicKey: payload.publicKey,
      })
    ).toBe(false);
  });
});

describe('Verify messages (RSV mode)', () => {
  const message = 'hi there how are you';
  // from the wallet
  const payload = {
    signature:
      '0c956388e3bf84a2873b2fdd9c6845cceb14cea0e342bdc233dbc25e32e84aa77d483f80160541c92bf3d48beed82dcbea58c3d3f93d7cbc3fbefdbd48cecf2e01',
    publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
  };
  const stxAddress = publicKeyToStxAddress(payload.publicKey);

  const hash = hashMessage(message);

  // make sure we can get the public key
  test(getPublicKeyFromSignature.name, () => {
    const { signature, recoveryBytes } = recoverSignature({
      signature: payload.signature,
    });
    const pk = bytesToHex(
      getPublicKeyFromSignature({
        hash,
        signature,
        recoveryBytes,
      })
    );
    expect(payload.publicKey).toEqual(pk);
  });

  test(verifyMessageSignature.name, () => {
    expect(
      verifyMessageSignature({
        message,
        signature: payload.signature,
        stxAddress,
      })
    ).toEqual(true);
  });

  test(`${verifyMessageSignature.name} should throw when no publicKey and no stxAddress`, () => {
    expect(() =>
      verifyMessageSignature({
        message,
        signature: payload.signature,
      })
    ).toThrow();
  });

  test('wrong message', () => {
    expect(
      verifyMessageSignature({
        message: 'something else',
        signature: payload.signature,
        publicKey: payload.publicKey,
      })
    ).toEqual(false);
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
});

describe(verifyStructuredMessageSignature.name, () => {
  const ADDRESS = 'SP2JXKMSH007NPYAQHKJPQMAQYAD90NQGTVJVQ02B';

  const structuredData = tupleCV({
    a: intCV(-1),
    b: uintCV(1),
    c: bufferCVFromString('test'),
    d: trueCV(),
    e: someCV(trueCV()),
    f: noneCV(),
    g: standardPrincipalCV(ADDRESS),
    h: contractPrincipalCV(ADDRESS, 'test'),
    i: responseOkCV(trueCV()),
    j: responseErrorCV(falseCV()),
    k: listCV([trueCV(), falseCV()]),
    l: tupleCV({
      a: trueCV(),
      b: falseCV(),
    }),
    m: stringAsciiCV('hello world'),
    another: tupleCV({
      a: trueCV(),
      b: falseCV(),
      deep: tupleCV({
        a: trueCV(),
        b: falseCV(),
      }),
    }),
    n: stringUtf8CV('hello \u{1234}'),
    o: listCV([]),
  });

  const domainOpts = {
    name: 'New Remix App',
    version: '1.0.0',
    chainId: ChainID.Testnet,
  };

  const payload = {
    signature:
      'cd435e143ee5c5054691a9e6bbdc149167aeb5fb0b993e238ae0a2cf9a3e213502980fb8851a1075865fa28bbf240af28c5b70db05c29233057cfa5c78db0f2e00',
    publicKey: '035b08fd4d14786187f51a3360864665fa437a9ad22bbdf7ae716d4599f26943a7',
  };

  const stxAddress = publicKeyToStxAddress(payload.publicKey, StacksNetworkVersion.testnetP2PKH);

  it('should hash correctly', () => {
    const EXPECTED_HASH = '4b5e42581f9410dda87bbb2f859e0943efd2198d3cb87c380539f423316a9e21';

    const { domain, message } = getStructuredDataHashes({
      domain: domainOpts,
      message: structuredData,
    });

    const hashBytes = makeStructuredDataHash(domain, message);
    const hex = bytesToHex(hashBytes);
    expect(hex).toEqual(EXPECTED_HASH);
  });

  it('should be fail with no public key', () => {
    expect(() => {
      verifyStructuredMessageSignature({
        message: structuredData,
        domain: domainOpts,
        signature: payload.signature,
      });
    }).toThrow();
  });

  it('should be valid if pass public key', () => {
    const isValid = verifyStructuredMessageSignature({
      message: structuredData,
      domain: domainOpts,
      signature: payload.signature,
      publicKey: payload.publicKey,
    });
    expect(isValid).toEqual(true);
  });

  it('should be valid if pass stxAddress', () => {
    const isValid = verifyStructuredMessageSignature({
      message: structuredData,
      domain: domainOpts,
      signature: payload.signature,
      stxAddress,
    });
    expect(isValid).toEqual(true);
  });

  test('get the pk from structured message', () => {
    const { signature, recoveryBytes } = recoverSignature({
      signature: payload.signature,
      mode: 'rsv',
    });

    const { domain, message } = getStructuredDataHashes({
      domain: domainOpts,
      message: structuredData,
    });

    const hashBytes = makeStructuredDataHash(domain, message);
    const pk = bytesToHex(
      getPublicKeyFromSignature({
        hash: hashBytes,
        signature,
        recoveryBytes,
      })
    );
    expect(payload.publicKey).toEqual(pk);
  });
});
