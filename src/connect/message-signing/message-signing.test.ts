import { SignatureRequestOptions, signMessage } from '@stacks/connect';
import {
  generateSignMessagePayload,
  hashMessage,
  verifyMessageSignature,
} from 'micro-stacks/connect';
import { utils } from '@noble/secp256k1';

import { getPublicKey, privateKeyToStxAddress } from 'micro-stacks/crypto';
import { signWithKey } from 'micro-stacks/transactions';
import { extractSignatureParts } from './verify';
import { bytesToHex, intToHexString } from 'micro-stacks/common';

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

  // TODO: this will not work until hiro fixes implementation
  // test('structured message', async () => {
  //   const message = tupleCV({ hello: stringAsciiCV('world') });
  //   const token = await signStructuredMessage({
  //     ...baseOpts,
  //     message,
  //     userSession: {
  //       loadUserData() {
  //         return {
  //           appPrivateKey: privateKey,
  //         } as any;
  //       },
  //     } as any,
  //   });
  //
  //   const token_2 = await generateSignStructuredDataPayload({
  //     ...baseOpts,
  //     message,
  //     privateKey,
  //   });
  //   expect(token).toEqual(token_2);
  // });

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
      signature: signatureVrs.data,
    });
    const parts = extractSignatureParts({
      hash,
      signature: signatureVrs.data,
    });

    expect(bytesToHex(parts.publicKey)).toEqual(publicKey);
    expect(intToHexString(parts.recoveryBytes, 1) + parts.signature.toCompactHex()).toEqual(
      signatureVrs.data
    );

    expect(verify).toEqual(true);
  });
});
