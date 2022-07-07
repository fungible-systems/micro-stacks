import { SignInWithStacksMessage } from './index';

import { privateKeyToStxAddress, StacksNetworkVersion } from 'micro-stacks/crypto';
import { bytesToHex, ChainID } from 'micro-stacks/common';
import { createStacksPrivateKey, signWithKey } from 'micro-stacks/transactions';
import { hashMessage } from 'micro-stacks/connect';

export function signatureVrsToRsv(signature: string) {
  return signature.slice(2) + signature.slice(0, 2);
}

const privateKey = '82db81f7710be42e5bbbab151801d41101c0af55f3b772cbaeae80cab7bd5b8f';
const stxAddress = privateKeyToStxAddress(privateKey, StacksNetworkVersion.mainnetP2PKH, true);

const nonce = '1234567895654654654';

const domain = 'https://fake.app/asdad';

describe('SignInWithStacksMessage', () => {
  test('basic', async () => {
    try {
      const stacksMessage = new SignInWithStacksMessage({
        domain,
        address: stxAddress,
        statement: 'Sign in with Stacks',
        uri: 'https://fake.app',
        version: '1',
        chainId: ChainID.Mainnet,
        nonce,
      });

      const message = stacksMessage.prepareMessage();

      const signed = await signWithKey(
        createStacksPrivateKey(privateKey),
        bytesToHex(hashMessage(message))
      );

      const isValid = await stacksMessage.verify({
        domain,
        nonce,
        signature: signatureVrsToRsv(signed.data),
      });

      expect(isValid.success).toBe(true);
    } catch (e) {
      console.error(e);
      expect(e).toBe(null);
    }
  });
});
