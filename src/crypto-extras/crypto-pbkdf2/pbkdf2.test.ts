import { createPbkdf2 } from 'micro-stacks/crypto-pbkdf2';
import { bytesToHex, utf8ToBytes } from 'micro-stacks/common';

const data = {
  description: 'Unicode salt, no truncation',
  key: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
  salt: 'mnemonicメートルガバヴァぱばぐゞちぢ十人十色',
  iterations: 2048,
  dkLen: 64,
  result:
    'ba553eedefe76e67e2602dc20184c564010859faada929a090dd2c57aacb204ceefd15404ab50ef3e8dbeae5195aeae64b0def4d2eead1cdc728a33ced520ffd',
};
describe(createPbkdf2.name, function () {
  it('should work', async () => {
    const pbkdf2 = await createPbkdf2();
    const thing = await pbkdf2.derive(
      data.key,
      utf8ToBytes(data.salt),
      data.iterations,
      data.dkLen,
      'sha512'
    );
    expect(bytesToHex(thing)).toEqual(data.result);
  });
});
