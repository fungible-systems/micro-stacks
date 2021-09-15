import { signECDSA, verifyECDSA } from 'micro-stacks/crypto';
import { utf8ToBytes } from 'micro-stacks/common';

const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';

test('sign-to-verify-works', async () => {
  const testString = 'all work and no play makes jack a dull boy';
  let sigObj = await signECDSA({
    privateKey,
    contents: testString,
  });
  expect(
    verifyECDSA({
      contents: testString,
      publicKey: sigObj.publicKey,
      signature: sigObj.signature,
    })
  ).toEqual(true);

  const testBuffer = utf8ToBytes(testString);
  sigObj = await signECDSA({ privateKey, contents: testBuffer });
  expect(
    verifyECDSA({
      contents: testBuffer,
      publicKey: sigObj.publicKey,
      signature: sigObj.signature,
    })
  ).toEqual(true);
});

test('sign-to-verify-fails', async () => {
  const testString = 'all work and no play makes jack a dull boy';
  const failString = 'I should fail';

  let sigObj = await signECDSA({
    privateKey,
    contents: testString,
  });
  expect(
    verifyECDSA({
      contents: failString,
      publicKey: sigObj.publicKey,
      signature: sigObj.signature,
    })
  ).toEqual(false);

  const testBuffer = utf8ToBytes(testString);
  sigObj = await signECDSA({ privateKey, contents: testBuffer });
  expect(
    verifyECDSA({
      contents: utf8ToBytes(failString),
      publicKey: sigObj.publicKey,
      signature: sigObj.signature,
    })
  ).toEqual(false);

  const badPK = '0288580b020800f421d746f738b221d384f098e911b81939d8c94df89e74cba776';
  expect(
    verifyECDSA({
      contents: utf8ToBytes(testString),
      publicKey: badPK,
      signature: sigObj.signature,
    })
  ).toEqual(false);
});
