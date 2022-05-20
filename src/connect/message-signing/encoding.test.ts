import {
  encodeMessage as stacksEncodeMessage,
  hashMessage as stacksHashMessage,
} from '@stacks/encryption';
import { encodeMessage, hashMessage } from './encoding';
import { bytesToHex } from 'micro-stacks/common';

describe('encoding', function () {
  test('compat', () => {
    const message = stacksEncodeMessage('hi there');
    const myMessage = encodeMessage('hi there');
    expect(bytesToHex(message)).toEqual(bytesToHex(myMessage));
  });
  test('message from wallet', () => {
    const hash = bytesToHex(hashMessage('hi there'));
    expect(hash).toEqual('9b96a1fe1d548cbbc960cc6a0286668fd74a763667b06366fb2324269fcabaa4');
  });
  test('hashing', () => {
    const message = bytesToHex(stacksHashMessage('hi there'));
    const myMessage = bytesToHex(hashMessage('hi there'));
    expect(message).toEqual(myMessage);
  });
});
