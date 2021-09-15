import { encryptECIES, decryptECIES } from 'micro-stacks/crypto';
import { makeECPrivateKey, getPublicKeyFromPrivate } from '@stacks/encryption';

test(encryptECIES.name, async () => {
  const privateKey = makeECPrivateKey();
  const publicKey = getPublicKeyFromPrivate(privateKey);

  const original = 'hello world';

  const cipherObject = await encryptECIES({
    publicKey,
    content: Buffer.from(original),
    wasString: true,
  });

  const decrypted = await decryptECIES({
    cipherObject,
    privateKey,
  });

  expect(original).toEqual(decrypted);
});
