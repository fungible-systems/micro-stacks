import { SignatureRequestOptions, signMessage, signStructuredMessage } from '@stacks/connect';
import {
  generateSignMessagePayload,
  generateSignStructuredDataPayload,
} from 'micro-stacks/connect';
import { getAddressFromPrivateKey } from '@stacks/transactions';
import { stringAsciiCV, tupleCV } from 'micro-stacks/clarity';

const privateKey = '82db81f7710be42e5bbbab151801d41101c0af55f3b772cbaeae80cab7bd5b8f';
const stxAddress = getAddressFromPrivateKey(privateKey);
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

  test('structured message', async () => {
    const message = tupleCV({ hello: stringAsciiCV('world') });
    const token = await signStructuredMessage({
      ...baseOpts,
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
      privateKey,
    });
    expect(token).toEqual(token_2);
  });
});
