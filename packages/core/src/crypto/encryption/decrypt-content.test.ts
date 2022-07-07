import { decryptContent } from 'micro-stacks/crypto';
import { bytesToHex } from 'micro-stacks/common';
import { utils } from '@noble/secp256k1';

describe(decryptContent.name, () => {
  it('should throw when no private key passed', () => {
    expect(
      // @ts-expect-error: needs to throw
      () => decryptContent('asdasda', {})
    ).toThrow();
  });

  it('should throw when when json is wrong', () => {
    expect(() =>
      decryptContent('asdasda', { privateKey: bytesToHex(utils.randomPrivateKey()) })
    ).toThrow();
  });

  it('should throw when when it is not actually encrypted content', async () => {
    await expect(
      decryptContent(JSON.stringify({ hello: 'world' }), {
        privateKey: bytesToHex(utils.randomPrivateKey()),
      })
    ).rejects.toThrow();
  });
});
