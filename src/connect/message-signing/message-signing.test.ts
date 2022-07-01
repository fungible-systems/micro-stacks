import { SignatureRequestOptions, signMessage, signStructuredMessage } from '@stacks/connect';
import {
  generateSignMessagePayload,
  generateSignStructuredDataPayload,
  hashMessage,
  verifyMessageSignature,
} from 'micro-stacks/connect';
import { utils } from '@noble/secp256k1';

import { decodeToken, getPublicKey, privateKeyToStxAddress } from 'micro-stacks/crypto';
import { signWithKey } from 'micro-stacks/transactions';
import { recoverSignature } from './verify';
import { bytesToHex, ChainID, intToHexString } from 'micro-stacks/common';
import { stringAsciiCV, tupleCV } from 'micro-stacks/clarity';
import { makeDomainTuple } from './structured-message';

const privateKey = '82db81f7710be42e5bbbab151801d41101c0af55f3b772cbaeae80cab7bd5b8f';
const stxAddress = privateKeyToStxAddress(privateKey);

const baseOpts = {
  stxAddress,
  message: 'hello world',
  appDetails: {
    name: 'some test app',
    icon: 'icon',
  },
};

const domainOpts = {
  name: 'New Remix App',
  version: '1.0.0',
  chainId: ChainID.Testnet,
};

describe('Signed message', () => {
  test('simple message', async () => {
    const opts: SignatureRequestOptions = {
      ...baseOpts,
      userSession: {
        loadUserData() {
          return {
            appPrivateKey: privateKey,
          } as any;
        },
      } as any,
    };
    const token = await signMessage(opts);

    const token_2 = await generateSignMessagePayload({
      ...baseOpts,
      privateKey,
    });
    expect(token).toEqual(token_2);
  });

  test('structured message', async () => {
    const message = tupleCV({ hello: stringAsciiCV('world') });
    const token = await signStructuredMessage({
      ...baseOpts,
      domain: makeDomainTuple(domainOpts.name, domainOpts.version, domainOpts.chainId),
      message,
      userSession: {
        loadUserData() {
          return {
            appPrivateKey: privateKey,
          } as any;
        },
      } as any,
    });

    const token_2 = await generateSignStructuredDataPayload({
      ...baseOpts,
      message,
      domain: domainOpts,
      privateKey,
    });

    expect((decodeToken(token) as any).domain).toEqual((decodeToken(token_2) as any).domain);
    expect((decodeToken(token) as any).message).toEqual((decodeToken(token_2) as any).message);
    expect((decodeToken(token) as any).publicKey).toEqual((decodeToken(token_2) as any).publicKey);
    expect((decodeToken(token) as any).stxAddress).toEqual(
      (decodeToken(token_2) as any).stxAddress
    );
  });

  test('signWithKey', async () => {
    const stacksPrivateKey = utils.randomPrivateKey();
    const publicKey = bytesToHex(getPublicKey(stacksPrivateKey, true));
    const hash = hashMessage('hello');
    const signatureVrs = await signWithKey(
      {
        data: stacksPrivateKey,
        compressed: false,
      },
      bytesToHex(hash)
    );
    const verify = verifyMessageSignature({
      message: hash,
      publicKey,
      signature: signatureVrs.data,
      mode: 'vrs',
    });
    const parts = recoverSignature({
      signature: signatureVrs.data,
    });

    expect(parts.signature.toCompactHex() + intToHexString(parts.recoveryBytes, 1)).toEqual(
      signatureVrs.data
    );

    expect(verify).toEqual(true);
  });
});
