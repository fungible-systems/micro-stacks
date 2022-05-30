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
  test('hashing', () => {
    const message = bytesToHex(stacksHashMessage('hi there'));
    const myMessage = bytesToHex(hashMessage('hi there'));
    expect(message).toEqual(myMessage);
  });
});
