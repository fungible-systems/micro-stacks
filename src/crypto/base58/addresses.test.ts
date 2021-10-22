import { publicKeyToBase58Address, hashP2SH } from 'micro-stacks/crypto';
import { getPublicKey } from 'micro-stacks/crypto';
import { hexToBytes } from 'micro-stacks/common';

describe('micro-stacks/crypto', () => {
  it(publicKeyToBase58Address.name, () => {
    const privateKey = '00cdce6b5f87d38f2a830cae0da82162e1b487f07c5affa8130f01fe1a2a25fb01';
    const publicKey = getPublicKey(privateKey.slice(0, 64), true);
    const expectedAddress = '1WykMawQRnLh7SWmmoRL4qTDNCgAsVRF1';

    expect(publicKeyToBase58Address(publicKey)).toEqual(expectedAddress);
  });

  it(`${hashP2SH.name} will throw over limit`, () => {
    const privateKey = '00cdce6b5f87d38f2a830cae0da82162e1b487f07c5affa8130f01fe1a2a25fb01';
    const publicKey = getPublicKey(privateKey.slice(0, 64), true);

    expect(() =>
      hashP2SH(
        999,
        new Array(16).map(() => hexToBytes(publicKey))
      )
    ).toThrow('P2SH multisig address can only contain up to 15 public keys');
  });
});
