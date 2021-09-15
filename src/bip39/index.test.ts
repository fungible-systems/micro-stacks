import {
  generateMnemonic,
  mnemonicToEntropy,
  entropyToMnemonic,
  mnemonicToSeed,
  validateMnemonic,
} from './index';
import { bytesToHex } from 'micro-stacks/common';
import vectors from '../../tests/bip39-vectors.json';
import BAD_VECTORS from '../../tests/bip39-vectors-bad.json';

const PASSWORD = 'TREZOR';

describe(generateMnemonic.name, function () {
  it('can generate a mnemonic', () => {
    const thing = generateMnemonic();
    expect(thing).toBeTruthy();
  });

  test('all vectors', async () => {
    await Promise.all(
      vectors.english.map(async vector => {
        const ventropy = vector[0];
        const vmnemonic = vector[1];
        const vseedHex = vector[2];

        const entropy = mnemonicToEntropy(vmnemonic);
        const mnemonic = entropyToMnemonic(ventropy);
        const seed = await mnemonicToSeed(mnemonic, PASSWORD);

        expect(entropy).toEqual(ventropy);
        expect(mnemonic).toEqual(vmnemonic);
        expect(bytesToHex(seed)).toEqual(vseedHex);
      })
    );
  });

  it('should throw', () => {
    expect(() => {
      entropyToMnemonic(Buffer.from('', 'hex'));
    }).toThrow('Invalid entropy');

    expect(() => {
      entropyToMnemonic(Buffer.from('000000', 'hex'));
    }).toThrow('Invalid entropy');

    expect(() => {
      entropyToMnemonic(Buffer.from(new Array(1028 + 1).join('00'), 'hex'));
    }).toThrow('Invalid entropy');

    for (const vector of BAD_VECTORS) {
      expect(validateMnemonic(vector.mnemonic)).toEqual(false);
    }
  });
});
