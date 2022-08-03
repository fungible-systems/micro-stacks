import {vi} from 'vitest'
import { bytesToHex, hexToBytes } from 'micro-stacks/common';
import { encryptMnemonic } from './encrypt-mnemonic';
import { decryptMnemonic } from './decrypt-mnemonic';
import { fail } from 'assert';

describe('encryptMnemonic & decryptMnemonic', () => {
  const rawPhrase =
    'march eager husband pilot waste rely exclude taste ' + 'twist donkey actress scene';
  const rawPassword = 'testtest';
  const encryptedPhrase =
    'ffffffffffffffffffffffffffffffffca638cc39fc270e8be5c' +
    'bf98347e42a52ee955e287ab589c571af5f7c80269295b0039e32ae13adf11bc6506f5ec' +
    '32dda2f79df4c44276359c6bac178ae393de';

  const preEncryptedPhrase =
    '7573f4f51089ba7ce2b95542552b7504de7305398637733' +
    '0579649dfbc9e664073ba614fac180d3dc237b21eba57f9aee5702ba819fe17a0752c4dc7' +
    '94884c9e75eb60da875f778bbc1aaca1bd373ea3';

  it('should encrypt', async () => {
    const mockSalt = Buffer.from('ff'.repeat(16), 'hex');
    const encoded = await encryptMnemonic(rawPhrase, rawPassword, mockSalt);
    expect(bytesToHex(encoded) === encryptedPhrase).toEqual(true);
  });

  it('should decrypt', async () => {
    const decoded = await decryptMnemonic(hexToBytes(encryptedPhrase), rawPassword);
    expect(decoded === rawPhrase).toEqual(true);
  });

  it('can encrypt and then decrypt', async () => {
    // Test encryption -> decryption. Can't be done with hard-coded values
    // due to random salt.
    await encryptMnemonic(rawPhrase, rawPassword)
      .then(
        encoded => decryptMnemonic(encoded, rawPassword),
        err => {
          fail(`Should encrypt mnemonic phrase, instead errored: ${err}`);
        }
      )
      .then(
        (decoded: string) => {
          expect(decoded === rawPhrase).toEqual(true);
        },
        err => {
          fail(`Should decrypt encrypted phrase, instead errored: ${err}`);
        }
      );
  });

  it('should error', async () => {
    const errorCallback = vi.fn();

    await encryptMnemonic('not a mnemonic phrase', 'password').then(() => {
      fail('Should have thrown on invalid mnemonic input');
    }, errorCallback);

    expect(errorCallback).toHaveBeenCalledTimes(1);

    await decryptMnemonic(preEncryptedPhrase, 'incorrect password').then(() => {
      fail('Should have thrown on incorrect password for decryption');
    }, errorCallback);

    expect(errorCallback).toHaveBeenCalledTimes(2);
  });
});
