import {
  encodeMessage as stacksEncodeMessage,
  hashMessage as stacksHashMessage,
} from '@stacks/encryption';
import { encodeMessage, hashMessage } from './encoding';
import { bytesToHex } from 'micro-stacks/common';

describe('encoding', function () {
  test('compat', () => {
    const message = stacksEncodeMessage('hello');
    const myMessage = encodeMessage('hello');
    expect(bytesToHex(message)).toEqual(bytesToHex(myMessage));
  });
});

describe('hashing', function () {
  test('compat', () => {
    const message = stacksHashMessage('hello');
    const myMessage = hashMessage('hello');
    expect(bytesToHex(message)).toEqual(bytesToHex(myMessage));
  });
});
