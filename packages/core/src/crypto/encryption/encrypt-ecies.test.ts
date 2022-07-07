import { decryptECIES, encryptECIES } from 'micro-stacks/crypto';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';
import * as noble from '@noble/secp256k1';

const privateKey = bytesToHex(noble.utils.randomPrivateKey());
const publicKey = bytesToHex(noble.getPublicKey(privateKey, true));

describe(encryptECIES.name, () => {
  describe('encrypt decrypt', () => {
    test('hex', async () => {
      const testString = 'all work and no play makes jack a dull boy';
      const cipherObject = await encryptECIES({
        content: utf8ToBytes(testString),
        publicKey,
        wasString: true,
      });
      const deciphered = await decryptECIES({
        privateKey,
        cipherObject,
      });
      expect(deciphered).toEqual(testString);
    });

    test('base64', async () => {
      const testString = 'all work and no play makes jack a dull boy';
      const cipherObject = await encryptECIES({
        content: utf8ToBytes(testString),
        publicKey,
        wasString: true,
        cipherTextEncoding: 'base64',
      });
      const deciphered = await decryptECIES({
        privateKey,
        cipherObject,
      });
      expect(deciphered).toEqual(testString);
    });

    test('encrypt-to-decrypt fails on bad mac', async () => {
      const testString = 'all work and no play makes jack a dull boy';
      const cipherObject = await encryptECIES({
        content: utf8ToBytes(testString),
        publicKey,
        wasString: true,
      });
      const evilString = 'some work and some play makes jack a dull boy';
      const evilCipherObject = await encryptECIES({
        content: utf8ToBytes(evilString),
        publicKey,
        wasString: true,
      });

      cipherObject.cipherText = evilCipherObject.cipherText;

      try {
        await decryptECIES({ privateKey, cipherObject });
        expect(false).toEqual(true);
      } catch (e) {
        expect((e as any).message.indexOf('failure in MAC check')).not.toEqual(-1);
      }
    });
  });

  test('Should reject public key having invalid length', async () => {
    const invalidPublicKey = '0273d28f9951ce46538951e3697c62588a87f1f1f295de4a14fdd4c780fc52cfe69';

    const testString = 'all work and no play makes jack a dull boy';
    await expect(
      encryptECIES({
        publicKey: invalidPublicKey,
        content: utf8ToBytes(testString),
        wasString: true,
      })
    ).rejects.toThrow();
  });

  test('Should accept public key having valid length', async () => {
    const publicKey = '027d28f9951ce46538951e3697c62588a87f1f1f295de4a14fdd4c780fc52cfe69';
    const testString = 'all work and no play makes jack a dull boy';
    const thing = await encryptECIES({
      publicKey: publicKey,
      content: utf8ToBytes(testString),
      wasString: true,
    });
    // Should not throw invalid format exception
    expect(!!thing).toEqual(true);
  });

  test('Should reject invalid uncompressed public key', async () => {
    const invalidPublicKey =
      '02ad90e5b6bc86b3ec7fac2c5fbda7423fc8ef0d58df594c773fa05e2c281b2bfe877677c668bd13603944e34f4818ee03cadd81a88542b8b4d5431264180e2c28';
    const testString = 'all work and no play makes jack a dull boy';

    await expect(
      encryptECIES({
        publicKey: invalidPublicKey,
        content: utf8ToBytes(testString),
        wasString: true,
      })
    ).rejects.toThrow();
  });

  test('Should accept valid uncompressed public key', async () => {
    const publicKey =
      '04ad90e5b6bc86b3ec7fac2c5fbda7423fc8ef0d58df594c773fa05e2c281b2bfe877677c668bd13603944e34f4818ee03cadd81a88542b8b4d5431264180e2c28';
    const testString = 'all work and no play makes jack a dull boy';
    const thing = await encryptECIES({
      publicKey: publicKey,
      content: utf8ToBytes(testString),
      wasString: true,
    });
    // Should not throw invalid format exception
    expect(!!thing).toEqual(true);
  });

  test('Should reject invalid compressed public key', async () => {
    const invalidPublicKey = '017d28f9951ce46538951e3697c62588a87f1f1f295de4a14fdd4c780fc52cfe69';
    const testString = 'all work and no play makes jack a dull boy';

    await expect(
      encryptECIES({
        publicKey: invalidPublicKey,
        content: utf8ToBytes(testString),
        wasString: true,
      })
    ).rejects.toThrow();
  });

  test('Should accept valid compressed public key', async () => {
    const publicKey = '027d28f9951ce46538951e3697c62588a87f1f1f295de4a14fdd4c780fc52cfe69';
    const testString = 'all work and no play makes jack a dull boy';
    const thing = await encryptECIES({
      publicKey: publicKey,
      content: utf8ToBytes(testString),
      wasString: true,
    });
    // Should not throw invalid format exception
    expect(!!thing).toEqual(true);
  });
});
